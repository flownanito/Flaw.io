package io.flaw.vulnerabilities.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;
import java.util.Map;

final class OsvData {

    private OsvData() {
    }

    record QueryRequest(@JsonProperty("package") PackageInfo packageInfo, String version) {
    }

    record PackageInfo(String name, String ecosystem) {
    }

    record QueryResponse(List<OsvVulnerability> vulns) {
    }

    record OsvVulnerability(
            String id,
            String summary,
            String details,
            List<String> aliases,
            Instant published,
            List<OsvSeverity> severity,
            List<OsvAffected> affected,
            List<OsvReference> references,
            @JsonProperty("database_specific") Map<String, Object> databaseSpecific
    ) {
    }

    record OsvSeverity(String type, String score) {
    }

    record OsvAffected(
            @JsonProperty("package") PackageInfo packageInfo,
            List<OsvRange> ranges,
            List<String> versions
    ) {
    }

    record OsvRange(String type, List<OsvEvent> events) {
    }

    record OsvEvent(String introduced, String fixed, @JsonProperty("last_affected") String lastAffected, String limit) {
    }

    record OsvReference(String type, String url) {
    }
}
