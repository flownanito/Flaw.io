package io.flaw.vulnerabilities.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.vulnerabilities.model.AnalysisRun;
import io.flaw.vulnerabilities.repository.AnalysisRunRepository;
import io.flaw.vulnerabilities.repository.ScanFindingRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalysisServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ScanFindingRepository scanFindingRepository;

    @Autowired
    private AnalysisRunRepository analysisRunRepository;

    @MockitoBean
    private OsvClient osvClient;

    @BeforeEach
    void cleanDatabase() {
        scanFindingRepository.deleteAllInBatch();
        analysisRunRepository.deleteAllInBatch();
        projectRepository.deleteAllInBatch();
    }

    @Test
    void scansTrackedVersionsPersistsFindingsAndMarksChangedInventoryStale() throws Exception {
        when(osvClient.query(eq(Ecosystem.NPM), eq("lodash"), eq("4.17.20")))
                .thenReturn(List.of(lodashAdvisory()));

        MvcResult projectResult = mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"analysis integration","description":"test"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode project = objectMapper.readTree(projectResult.getResponse().getContentAsString());
        long projectId = project.get("id").asLong();

        mockMvc.perform(post("/api/projects/{id}/dependencies", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"ecosystem":"NPM","packageName":"lodash","version":"4.17.20"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/analysis/scan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scanned").value(true))
                .andExpect(jsonPath("$.upToDate").value(true))
                .andExpect(jsonPath("$.dependencyCount").value(1))
                .andExpect(jsonPath("$.findingCount").value(1));

        MvcResult alertsResult = mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vulnerability.cveId").value("CVE-2021-23337"))
                .andExpect(jsonPath("$[0].vulnerability.source").value("OSV"))
                .andExpect(jsonPath("$[0].vulnerability.cvssScore").value(7.5))
                .andExpect(jsonPath("$[0].projectName").value("analysis integration"))
                .andExpect(jsonPath("$[0].vulnerability.patchedVersion").value("4.17.21"))
                .andExpect(jsonPath("$[0].details").isNotEmpty())
                .andReturn();
        JsonNode alert = objectMapper.readTree(alertsResult.getResponse().getContentAsString()).get(0);
        assertTrue(alert.get("details").asText().length() > alert.get("vulnerability")
                .get("description").asText().length());

        mockMvc.perform(get("/api/analysis/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upToDate").value(true));

        mockMvc.perform(post("/api/projects/{id}/dependencies", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"ecosystem":"NPM","packageName":"axios","version":"1.0.0"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/analysis/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scanned").value(true))
                .andExpect(jsonPath("$.upToDate").value(false));

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    private OsvData.OsvVulnerability lodashAdvisory() {
        return new OsvData.OsvVulnerability(
                "GHSA-29mw-wpgm-hmr9",
                "Regular Expression Denial of Service in lodash",
                "A test advisory from OSV. " + "Detailed technical impact and affected usage. ".repeat(20),
                List.of("CVE-2021-23337"),
                Instant.parse("2021-02-15T00:00:00Z"),
                List.of(new OsvData.OsvSeverity("CVSS_V3", "7.5")),
                List.of(new OsvData.OsvAffected(
                        new OsvData.PackageInfo("lodash", "npm"),
                        List.of(new OsvData.OsvRange(
                                "SEMVER",
                                List.of(new OsvData.OsvEvent("0", null, null, null),
                                        new OsvData.OsvEvent(null, "4.17.21", null, null))
                        )),
                        List.of()
                )),
                List.of(new OsvData.OsvReference("ADVISORY", "https://osv.dev/vulnerability/GHSA-29mw-wpgm-hmr9")),
                Map.of()
        );
    }
}
