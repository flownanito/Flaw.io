package io.flaw.vulnerabilities.repository;

import io.flaw.vulnerabilities.model.AnalysisRun;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalysisRunRepository extends JpaRepository<AnalysisRun, Long> {
}
