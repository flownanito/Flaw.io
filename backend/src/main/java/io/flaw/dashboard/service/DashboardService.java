package io.flaw.dashboard.service;

import io.flaw.dashboard.dto.DashboardSummaryResponse;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.projects.repository.TrackedDependencyRepository;
import io.flaw.vulnerabilities.service.AnalysisService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TrackedDependencyRepository dependencyRepository;
    private final AnalysisService analysisService;

    public DashboardService(
            ProjectRepository projectRepository,
            TrackedDependencyRepository dependencyRepository,
            AnalysisService analysisService
    ) {
        this.projectRepository = projectRepository;
        this.dependencyRepository = dependencyRepository;
        this.analysisService = analysisService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        return new DashboardSummaryResponse(
                projectRepository.count(),
                dependencyRepository.count(),
                analysisService.findAllVulnerabilities().size(),
                analysisService.findAllAlerts().size()
        );
    }
}
