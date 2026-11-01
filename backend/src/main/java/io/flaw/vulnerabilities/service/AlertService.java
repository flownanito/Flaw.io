package io.flaw.vulnerabilities.service;

import io.flaw.projects.dto.DependencyResponse;
import io.flaw.projects.model.Project;
import io.flaw.projects.model.TrackedDependency;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.vulnerabilities.dto.AlertResponse;
import io.flaw.vulnerabilities.dto.VulnerabilityResponse;
import io.flaw.vulnerabilities.repository.VulnerabilityRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlertService {

    private final ProjectRepository projectRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final VersionRangeMatcher versionRangeMatcher;

    public AlertService(
            ProjectRepository projectRepository,
            VulnerabilityRepository vulnerabilityRepository,
            VersionRangeMatcher versionRangeMatcher
    ) {
        this.projectRepository = projectRepository;
        this.vulnerabilityRepository = vulnerabilityRepository;
        this.versionRangeMatcher = versionRangeMatcher;
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findAll() {
        List<Project> projects = projectRepository.findAllByOrderByCreatedAtDesc();
        List<VulnerabilityResponse> vulnerabilities = vulnerabilityRepository.findAllByOrderByPublishedAtDesc()
                .stream()
                .map(VulnerabilityResponse::from)
                .filter(vulnerability -> vulnerability.cvssScore().compareTo(java.math.BigDecimal.valueOf(7)) >= 0)
                .toList();

        return projects.stream()
                .flatMap(project -> project.getDependencies().stream()
                        .flatMap(dependency -> vulnerabilities.stream()
                                .filter(vulnerability -> matches(dependency, vulnerability))
                                .map(vulnerability -> AlertResponse.from(
                                        vulnerability,
                                        project,
                                        DependencyResponse.from(dependency)
                                ))))
                .toList();
    }

    private boolean matches(TrackedDependency dependency, VulnerabilityResponse vulnerability) {
        return dependency.getEcosystem() == vulnerability.ecosystem()
                && dependency.getPackageName().equalsIgnoreCase(vulnerability.packageName())
                && versionRangeMatcher.matches(dependency.getVersion(), vulnerability.vulnerableVersions());
    }
}
