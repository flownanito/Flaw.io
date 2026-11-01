package io.flaw.projects.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProjectRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 500) String description,
        @Size(max = 500)
        @Pattern(regexp = "^$|^https?://\\S+$", message = "must be an http or https URL")
        String repositoryUrl
) {
}
