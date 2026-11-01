package io.flaw.vulnerabilities.dto;

import io.flaw.projects.dto.DependencyResponse;
import io.flaw.projects.model.Project;

public record AlertResponse(
        VulnerabilityResponse vulnerability,
        Long projectId,
        String projectName,
        DependencyResponse dependency
) {
    public static AlertResponse from(
            VulnerabilityResponse vulnerability,
            Project project,
            DependencyResponse dependency
    ) {
        return new AlertResponse(vulnerability, project.getId(), project.getName(), dependency);
    }
}
