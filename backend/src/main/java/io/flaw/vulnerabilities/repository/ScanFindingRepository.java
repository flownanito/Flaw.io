package io.flaw.vulnerabilities.repository;

import io.flaw.vulnerabilities.model.ScanFinding;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScanFindingRepository extends JpaRepository<ScanFinding, Long> {

    @EntityGraph(attributePaths = {"dependency", "dependency.project"})
    List<ScanFinding> findAllByOrderByPublishedAtDesc();
}
