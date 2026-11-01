package io.flaw.vulnerabilities.model;

import io.flaw.projects.model.TrackedDependency;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "scan_findings", uniqueConstraints = @UniqueConstraint(
        name = "uq_scan_finding_dependency_advisory",
        columnNames = {"dependency_id", "advisory_id"}
))
public class ScanFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dependency_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private TrackedDependency dependency;

    @Column(name = "advisory_id", nullable = false, length = 100)
    private String advisoryId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "full_details", columnDefinition = "TEXT")
    private String fullDetails;

    @Column(name = "vulnerable_versions", nullable = false, columnDefinition = "TEXT")
    private String vulnerableVersions;

    @Column(name = "patched_version", length = 100)
    private String patchedVersion;

    @Column(name = "cvss_score", precision = 3, scale = 1)
    private BigDecimal cvssScore;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "reference_url", length = 1000)
    private String referenceUrl;

    protected ScanFinding() {
    }

    public ScanFinding(
            TrackedDependency dependency,
            String advisoryId,
            String title,
            String description,
            String fullDetails,
            String vulnerableVersions,
            String patchedVersion,
            BigDecimal cvssScore,
            String severity,
            Instant publishedAt,
            String referenceUrl
    ) {
        this.dependency = dependency;
        this.advisoryId = advisoryId;
        this.title = title;
        this.description = description;
        this.fullDetails = fullDetails;
        this.vulnerableVersions = vulnerableVersions;
        this.patchedVersion = patchedVersion;
        this.cvssScore = cvssScore;
        this.severity = severity;
        this.publishedAt = publishedAt;
        this.referenceUrl = referenceUrl;
    }

    public TrackedDependency getDependency() {
        return dependency;
    }

    public String getAdvisoryId() {
        return advisoryId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getFullDetails() {
        return fullDetails;
    }

    public String getVulnerableVersions() {
        return vulnerableVersions;
    }

    public String getPatchedVersion() {
        return patchedVersion;
    }

    public BigDecimal getCvssScore() {
        return cvssScore;
    }

    public String getSeverity() {
        return severity;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public String getReferenceUrl() {
        return referenceUrl;
    }
}
