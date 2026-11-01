package io.flaw.vulnerabilities.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "analysis_runs")
public class AnalysisRun {

    @Id
    private Long id;

    @Column(name = "scanned_at", nullable = false)
    private Instant scannedAt;

    @Column(name = "dependency_count", nullable = false)
    private int dependencyCount;

    @Column(name = "finding_count", nullable = false)
    private int findingCount;

    @Column(name = "input_fingerprint", nullable = false, length = 64)
    private String inputFingerprint;

    protected AnalysisRun() {
    }

    public AnalysisRun(Instant scannedAt, int dependencyCount, int findingCount, String inputFingerprint) {
        this.id = 1L;
        this.scannedAt = scannedAt;
        this.dependencyCount = dependencyCount;
        this.findingCount = findingCount;
        this.inputFingerprint = inputFingerprint;
    }

    public Instant getScannedAt() {
        return scannedAt;
    }

    public int getDependencyCount() {
        return dependencyCount;
    }

    public int getFindingCount() {
        return findingCount;
    }

    public String getInputFingerprint() {
        return inputFingerprint;
    }
}
