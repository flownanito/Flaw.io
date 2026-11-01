package io.flaw.vulnerabilities.service;

import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.model.Project;
import io.flaw.projects.model.TrackedDependency;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.vulnerabilities.dto.AnalysisStatusResponse;
import io.flaw.vulnerabilities.dto.ScanFindingResponse;
import io.flaw.vulnerabilities.dto.VulnerabilityResponse;
import io.flaw.vulnerabilities.model.AnalysisRun;
import io.flaw.vulnerabilities.model.ScanFinding;
import io.flaw.vulnerabilities.repository.AnalysisRunRepository;
import io.flaw.vulnerabilities.repository.ScanFindingRepository;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalysisService {

    private static final int MAX_CONCURRENT_OSV_REQUESTS = 8;

    private final ProjectRepository projectRepository;
    private final ScanFindingRepository scanFindingRepository;
    private final AnalysisRunRepository analysisRunRepository;
    private final OsvClient osvClient;
    private final OsvFindingMapper findingMapper;

    public AnalysisService(
            ProjectRepository projectRepository,
            ScanFindingRepository scanFindingRepository,
            AnalysisRunRepository analysisRunRepository,
            OsvClient osvClient,
            OsvFindingMapper findingMapper
    ) {
        this.projectRepository = projectRepository;
        this.scanFindingRepository = scanFindingRepository;
        this.analysisRunRepository = analysisRunRepository;
        this.osvClient = osvClient;
        this.findingMapper = findingMapper;
    }

    @Transactional
    public AnalysisStatusResponse scan() {
        List<TrackedDependency> dependencies = currentDependencies();
        List<ScanFinding> findings = queryDependencies(dependencies);

        scanFindingRepository.deleteAllInBatch();
        if (!findings.isEmpty()) {
            scanFindingRepository.saveAll(findings);
        }

        AnalysisRun run = new AnalysisRun(
                java.time.Instant.now(),
                dependencies.size(),
                findings.size(),
                fingerprint(dependencies)
        );
        analysisRunRepository.save(run);
        return statusFor(run, dependencies);
    }

    @Transactional(readOnly = true)
    public AnalysisStatusResponse status() {
        List<TrackedDependency> dependencies = currentDependencies();
        return analysisRunRepository.findById(1L)
                .map(run -> statusFor(run, dependencies))
                .orElseGet(AnalysisStatusResponse::notScanned);
    }

    @Transactional(readOnly = true)
    public List<ScanFindingResponse> findAllAlerts() {
        if (!status().upToDate()) {
            return List.of();
        }
        return scanFindingRepository.findAllByOrderByPublishedAtDesc().stream()
                .map(ScanFindingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VulnerabilityResponse> findAllVulnerabilities() {
        Map<String, VulnerabilityResponse> distinct = new LinkedHashMap<>();
        for (ScanFindingResponse finding : findAllAlerts()) {
            VulnerabilityResponse vulnerability = finding.vulnerability();
            String key = vulnerability.cveId() + "\u0000"
                    + vulnerability.ecosystem() + "\u0000" + vulnerability.packageName();
            distinct.putIfAbsent(key, vulnerability);
        }
        return List.copyOf(distinct.values());
    }

    private List<ScanFinding> queryDependencies(List<TrackedDependency> dependencies) {
        LinkedHashSet<DependencyKey> keys = new LinkedHashSet<>();
        dependencies.forEach(dependency -> keys.add(DependencyKey.from(dependency)));
        if (keys.isEmpty()) {
            return List.of();
        }

        Map<DependencyKey, CompletableFuture<List<OsvData.OsvVulnerability>>> queries = new LinkedHashMap<>();
        try (ExecutorService executor = Executors.newFixedThreadPool(
                Math.min(MAX_CONCURRENT_OSV_REQUESTS, keys.size())
        )) {
            for (DependencyKey key : keys) {
                queries.put(key, CompletableFuture.supplyAsync(
                        () -> osvClient.query(key.ecosystem(), key.packageName(), key.version()),
                        executor
                ));
            }

            Map<DependencyKey, List<OsvData.OsvVulnerability>> results = new LinkedHashMap<>();
            for (Map.Entry<DependencyKey, CompletableFuture<List<OsvData.OsvVulnerability>>> query : queries.entrySet()) {
                try {
                    results.put(query.getKey(), query.getValue().join());
                } catch (CompletionException exception) {
                    if (exception.getCause() instanceof RuntimeException cause) {
                        throw cause;
                    }
                    throw exception;
                }
            }

            List<ScanFinding> findings = new ArrayList<>();
            for (TrackedDependency dependency : dependencies) {
                List<OsvData.OsvVulnerability> advisories = results.get(DependencyKey.from(dependency));
                for (OsvData.OsvVulnerability advisory : advisories) {
                    findingMapper.map(advisory, dependency).ifPresent(findings::add);
                }
            }
            return findings;
        }
    }

    private List<TrackedDependency> currentDependencies() {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(Project::getDependencies)
                .flatMap(List::stream)
                .toList();
    }

    private AnalysisStatusResponse statusFor(AnalysisRun run, List<TrackedDependency> dependencies) {
        return new AnalysisStatusResponse(
                true,
                run.getInputFingerprint().equals(fingerprint(dependencies)),
                run.getScannedAt(),
                run.getDependencyCount(),
                run.getFindingCount()
        );
    }

    private String fingerprint(List<TrackedDependency> dependencies) {
        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is required to validate the analysis fingerprint.", exception);
        }
        dependencies.stream()
                .sorted(Comparator.comparing(TrackedDependency::getId))
                .forEach(dependency -> {
                    updateDigest(digest, dependency.getId().toString());
                    updateDigest(digest, dependency.getEcosystem().name());
                    updateDigest(digest, dependency.getPackageName());
                    updateDigest(digest, dependency.getVersion());
                });
        return HexFormat.of().formatHex(digest.digest());
    }

    private void updateDigest(MessageDigest digest, String value) {
        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
        digest.update(ByteBuffer.allocate(Integer.BYTES).putInt(bytes.length).array());
        digest.update(bytes);
    }

    private record DependencyKey(Ecosystem ecosystem, String packageName, String version) {

        private static DependencyKey from(TrackedDependency dependency) {
            return new DependencyKey(
                    dependency.getEcosystem(),
                    dependency.getPackageName(),
                    dependency.getVersion()
            );
        }
    }
}
