package io.flaw.dashboard.service;

import io.flaw.dashboard.dto.DashboardSummaryResponse;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.projects.repository.TrackedDependencyRepository;
import io.flaw.vulnerabilities.service.AlertService;
import io.flaw.vulnerabilities.repository.VulnerabilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TrackedDependencyRepository dependencyRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final AlertService alertService;

    public DashboardService(
            ProjectRepository projectRepository,
            TrackedDependencyRepository dependencyRepository,
            VulnerabilityRepository vulnerabilityRepository,
            AlertService alertService
    ) {
        this.projectRepository = projectRepository;
        this.dependencyRepository = dependencyRepository;
        this.vulnerabilityRepository = vulnerabilityRepository;
        this.alertService = alertService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        return new DashboardSummaryResponse(
                projectRepository.count(),
                dependencyRepository.count(),
                vulnerabilityRepository.count(),
                alertService.findAll().size()
        );
    }
}
