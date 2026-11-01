package io.flaw.vulnerabilities.dto;

import io.flaw.projects.dto.DependencyResponse;
import io.flaw.projects.model.Project;
import io.flaw.projects.model.TrackedDependency;
import io.flaw.vulnerabilities.model.ScanFinding;
import io.flaw.vulnerabilities.model.VulnerabilitySource;
import java.time.Instant;

public record ScanFindingResponse(
        VulnerabilityResponse vulnerability,
        Long projectId,
        String projectName,
        DependencyResponse dependency,
        String details
) {
    public static ScanFindingResponse from(ScanFinding finding) {
        TrackedDependency dependency = finding.getDependency();
        Project project = dependency.getProject();
        VulnerabilityResponse vulnerability = new VulnerabilityResponse(
                finding.getAdvisoryId(),
                finding.getTitle(),
                finding.getDescription(),
                dependency.getEcosystem(),
                dependency.getPackageName(),
                finding.getVulnerableVersions(),
                finding.getPatchedVersion(),
                finding.getCvssScore(),
                finding.getSeverity(),
                finding.getPublishedAt(),
                VulnerabilitySource.OSV,
                finding.getReferenceUrl()
        );
        return new ScanFindingResponse(
                vulnerability,
                project.getId(),
                project.getName(),
                DependencyResponse.from(dependency),
                finding.getFullDetails()
        );
    }
}
