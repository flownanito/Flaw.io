package io.flaw.projects.controller;

import io.flaw.projects.dto.AddDependencyRequest;
import io.flaw.projects.dto.CreateProjectRequest;
import io.flaw.projects.dto.ProjectResponse;
import io.flaw.projects.service.ProjectService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> findAll() {
        return projectService.findAll();
    }

    @GetMapping("/{id}")
    public ProjectResponse findById(@PathVariable Long id) {
        return projectService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse created = projectService.create(request);
        return ResponseEntity.created(URI.create("/api/projects/" + created.id())).body(created);
    }

    @PostMapping("/{projectId}/dependencies")
    public ProjectResponse addDependency(
            @PathVariable Long projectId,
            @Valid @RequestBody AddDependencyRequest request
    ) {
        return projectService.addDependency(projectId, request);
    }

    @DeleteMapping("/{projectId}/dependencies/{dependencyId}")
    public ResponseEntity<Void> removeDependency(
            @PathVariable Long projectId,
            @PathVariable Long dependencyId
    ) {
        projectService.removeDependency(projectId, dependencyId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
