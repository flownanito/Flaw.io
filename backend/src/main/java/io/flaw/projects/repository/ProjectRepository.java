package io.flaw.projects.repository;

import io.flaw.projects.model.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @EntityGraph(attributePaths = "dependencies")
    List<Project> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "dependencies")
    Optional<Project> findWithDependenciesById(Long id);
}
