package io.flaw.vulnerabilities.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.model.TrackedDependency;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class OsvFindingMapperTest {

    private final OsvFindingMapper mapper = new OsvFindingMapper(new VersionRangeMatcher());

    @Test
    void mapsAffectedVersionsAndCleansLongDescriptions() {
        OsvData.OsvVulnerability advisory = new OsvData.OsvVulnerability(
                "GHSA-test",
                "Test advisory",
                "**A test** with [source](https://example.com). " + "Long advisory detail ".repeat(30),
                List.of("CVE-2026-12345"),
                Instant.parse("2026-01-01T00:00:00Z"),
                List.of(),
                List.of(new OsvData.OsvAffected(
                        new OsvData.PackageInfo("org.example:library", "Maven"),
                        List.of(new OsvData.OsvRange("ECOSYSTEM", List.of(
                                new OsvData.OsvEvent("2.0.0", null, null, null),
                                new OsvData.OsvEvent(null, "2.12.3", null, null),
                                new OsvData.OsvEvent("2.13.0", null, null, null),
                                new OsvData.OsvEvent(null, "2.15.0", null, null)
                        ))),
                        List.of()
                )),
                List.of(),
                Map.of()
        );
        TrackedDependency dependency = new TrackedDependency(
                Ecosystem.MAVEN,
                "org.example:library",
                "2.14.1"
        );

        var finding = mapper.map(advisory, dependency).orElseThrow();

        assertEquals("2.15.0", finding.getPatchedVersion());
        assertEquals(">= 2.13.0, < 2.15.0", finding.getVulnerableVersions().split(" OR ")[1]);
        assertTrue(finding.getDescription().startsWith("A test with source."));
        assertTrue(finding.getDescription().length() <= 280);
        assertTrue(finding.getDescription().endsWith("…"));
    }
}
