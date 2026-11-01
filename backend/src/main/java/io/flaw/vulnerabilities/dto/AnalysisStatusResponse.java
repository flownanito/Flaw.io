package io.flaw.vulnerabilities.dto;

import java.time.Instant;

public record AnalysisStatusResponse(
        boolean scanned,
        boolean upToDate,
        Instant scannedAt,
        int dependencyCount,
        int findingCount
) {
    public static AnalysisStatusResponse notScanned() {
        return new AnalysisStatusResponse(false, false, null, 0, 0);
    }
}
