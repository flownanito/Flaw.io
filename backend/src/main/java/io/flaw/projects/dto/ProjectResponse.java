package io.flaw.projects.dto;

import io.flaw.projects.model.Project;
import java.time.Instant;
import java.util.List;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        String repositoryUrl,
        Instant createdAt,
        List<DependencyResponse> dependencies
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getRepositoryUrl(),
                project.getCreatedAt(),
                project.getDependencies().stream().map(DependencyResponse::from).toList()
        );
    }
}
