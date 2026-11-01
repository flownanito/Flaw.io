package io.flaw.vulnerabilities.controller;

import io.flaw.vulnerabilities.dto.AnalysisStatusResponse;
import io.flaw.vulnerabilities.service.AnalysisService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/scan")
    public AnalysisStatusResponse scan() {
        return analysisService.scan();
    }

    @GetMapping("/status")
    public AnalysisStatusResponse status() {
        return analysisService.status();
    }
}
