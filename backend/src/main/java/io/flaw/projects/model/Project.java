package io.flaw.projects.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "repository_url", length = 500)
    private String repositoryUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TrackedDependency> dependencies = new ArrayList<>();

    protected Project() {
    }

    public Project(String name, String description, String repositoryUrl) {
        this.name = name;
        this.description = description;
        this.repositoryUrl = repositoryUrl;
        this.createdAt = Instant.now();
    }

    public void addDependency(TrackedDependency dependency) {
        dependencies.add(dependency);
        dependency.setProject(this);
    }

    public void removeDependency(TrackedDependency dependency) {
        dependencies.remove(dependency);
        dependency.setProject(null);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<TrackedDependency> getDependencies() {
        return dependencies;
    }
}
