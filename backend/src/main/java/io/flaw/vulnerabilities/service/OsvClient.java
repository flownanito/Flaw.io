package io.flaw.vulnerabilities.service;

import io.flaw.common.ExternalServiceException;
import io.flaw.projects.model.Ecosystem;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class OsvClient {

    private final RestClient restClient;

    public OsvClient(RestClient osvRestClient) {
        this.restClient = osvRestClient;
    }

    public List<OsvData.OsvVulnerability> query(Ecosystem ecosystem, String packageName, String version) {
        try {
            OsvData.QueryResponse response = restClient.post()
                    .uri("/v1/query")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new OsvData.QueryRequest(
                            new OsvData.PackageInfo(packageName, osvEcosystem(ecosystem)),
                            version
                    ))
                    .retrieve()
                    .body(OsvData.QueryResponse.class);
            return response == null || response.vulns() == null ? List.of() : response.vulns();
        } catch (RestClientException exception) {
            throw new ExternalServiceException("No se pudo consultar la base de vulnerabilidades de OSV.", exception);
        }
    }

    private String osvEcosystem(Ecosystem ecosystem) {
        return switch (ecosystem) {
            case NPM -> "npm";
            case MAVEN -> "Maven";
            case PYPI -> "PyPI";
            case GO -> "Go";
            case CARGO -> "crates.io";
        };
    }
}
