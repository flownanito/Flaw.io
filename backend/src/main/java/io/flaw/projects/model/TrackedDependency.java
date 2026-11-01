package io.flaw.projects.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "dependencies", uniqueConstraints = @UniqueConstraint(
        name = "uq_dependency_project_package",
        columnNames = {"project_id", "ecosystem", "package_name"}
))
public class TrackedDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Ecosystem ecosystem;

    @Column(name = "package_name", nullable = false, length = 255)
    private String packageName;

    @Column(nullable = false, length = 100)
    private String version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected TrackedDependency() {
    }

    public TrackedDependency(Ecosystem ecosystem, String packageName, String version) {
        this.ecosystem = ecosystem;
        this.packageName = packageName;
        this.version = version;
        this.createdAt = Instant.now();
    }

    void setProject(Project project) {
        this.project = project;
    }

    public Long getId() {
        return id;
    }

    public Ecosystem getEcosystem() {
        return ecosystem;
    }

    public String getPackageName() {
        return packageName;
    }

    public String getVersion() {
        return version;
    }
}
