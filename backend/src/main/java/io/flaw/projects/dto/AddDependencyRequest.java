package io.flaw.projects.dto;

import io.flaw.projects.model.Ecosystem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddDependencyRequest(
        @NotNull Ecosystem ecosystem,
        @NotBlank @Size(max = 255) String packageName,
        @NotBlank @Size(max = 100) String version
) {
}
