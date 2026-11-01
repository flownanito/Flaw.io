package io.flaw.projects.repository;

import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.model.TrackedDependency;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackedDependencyRepository extends JpaRepository<TrackedDependency, Long> {

    boolean existsByProjectIdAndEcosystemAndPackageNameIgnoreCase(
            Long projectId,
            Ecosystem ecosystem,
            String packageName
    );

    long countByProjectId(Long projectId);

    long count();
}
