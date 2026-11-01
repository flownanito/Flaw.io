package io.flaw.dashboard.dto;

public record DashboardSummaryResponse(
        long projectCount,
        long dependencyCount,
        long vulnerabilityCount,
        long activeAlertCount
) {
}
