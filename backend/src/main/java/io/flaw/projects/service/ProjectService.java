package io.flaw.projects.service;

import io.flaw.common.DuplicateResourceException;
import io.flaw.common.ResourceNotFoundException;
import io.flaw.projects.dto.AddDependencyRequest;
import io.flaw.projects.dto.CreateProjectRequest;
import io.flaw.projects.dto.ProjectResponse;
import io.flaw.projects.model.Project;
import io.flaw.projects.model.TrackedDependency;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.projects.repository.TrackedDependencyRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TrackedDependencyRepository dependencyRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            TrackedDependencyRepository dependencyRepository
    ) {
        this.projectRepository = projectRepository;
        this.dependencyRepository = dependencyRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> findAll() {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(Long id) {
        return ProjectResponse.from(findProject(id));
    }

    @Transactional
    public ProjectResponse create(CreateProjectRequest request) {
        Project project = new Project(
                request.name().trim(),
                clean(request.description()),
                clean(request.repositoryUrl())
        );
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse addDependency(Long projectId, AddDependencyRequest request) {
        Project project = findProject(projectId);
        String packageName = request.packageName().trim();
        if (dependencyRepository.existsByProjectIdAndEcosystemAndPackageNameIgnoreCase(
                projectId, request.ecosystem(), packageName)) {
            throw new DuplicateResourceException("This package is already tracked by the project.");
        }

        project.addDependency(new TrackedDependency(
                request.ecosystem(),
                packageName,
                request.version().trim()
        ));
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void removeDependency(Long projectId, Long dependencyId) {
        Project project = findProject(projectId);
        TrackedDependency dependency = project.getDependencies().stream()
                .filter(item -> item.getId().equals(dependencyId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Dependency not found."));
        project.removeDependency(dependency);
        projectRepository.save(project);
    }

    @Transactional
    public void delete(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found.");
        }
        projectRepository.deleteById(id);
    }

    private Project findProject(Long id) {
        return projectRepository.findWithDependenciesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
