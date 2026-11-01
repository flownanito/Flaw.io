package io.flaw.vulnerabilities.service;

import io.flaw.vulnerabilities.dto.AlertResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AlertService {

    private final AnalysisService analysisService;

    public AlertService(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    public List<AlertResponse> findAll() {
        return analysisService.findAllAlerts().stream()
                .map(finding -> new AlertResponse(
                        finding.vulnerability(),
                        finding.projectId(),
                        finding.projectName(),
                        finding.dependency(),
                        finding.details()
                ))
                .toList();
    }
}
