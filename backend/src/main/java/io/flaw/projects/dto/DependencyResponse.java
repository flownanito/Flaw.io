package io.flaw.projects.dto;

import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.model.TrackedDependency;

public record DependencyResponse(
        Long id,
        Ecosystem ecosystem,
        String packageName,
        String version
) {
    public static DependencyResponse from(TrackedDependency dependency) {
        return new DependencyResponse(
                dependency.getId(),
                dependency.getEcosystem(),
                dependency.getPackageName(),
                dependency.getVersion()
        );
    }
}
