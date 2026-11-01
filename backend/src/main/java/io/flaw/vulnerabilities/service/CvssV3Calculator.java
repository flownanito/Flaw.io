package io.flaw.vulnerabilities.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

final class CvssV3Calculator {

    private static final Set<String> ALLOWED_METRICS = Set.of(
            "AV", "AC", "PR", "UI", "S", "C", "I", "A",
            "E", "RL", "RC", "CR", "IR", "AR", "MAV", "MAC", "MPR", "MUI", "MS", "MC", "MI", "MA"
    );

    private CvssV3Calculator() {
    }

    static Optional<BigDecimal> calculateBaseScore(String vector) {
        if (vector == null || !(vector.startsWith("CVSS:3.0/") || vector.startsWith("CVSS:3.1/"))) {
            return Optional.empty();
        }

        Map<String, String> metrics = new HashMap<>();
        String[] parts = vector.split("/");
        for (int i = 1; i < parts.length; i++) {
            int separator = parts[i].indexOf(':');
            if (separator <= 0 || separator == parts[i].length() - 1) {
                return Optional.empty();
            }
            String name = parts[i].substring(0, separator);
            String value = parts[i].substring(separator + 1);
            if (!ALLOWED_METRICS.contains(name) || metrics.putIfAbsent(name, value) != null) {
                return Optional.empty();
            }
        }

        String scope = metrics.get("S");
        Double attackVector = metricValue(metrics, "AV", Map.of("N", 0.85, "A", 0.62, "L", 0.55, "P", 0.20));
        Double attackComplexity = metricValue(metrics, "AC", Map.of("L", 0.77, "H", 0.44));
        Double privilegesRequired = metricValue(
                metrics,
                "PR",
                "C".equals(scope) ? Map.of("N", 0.85, "L", 0.68, "H", 0.50)
                        : Map.of("N", 0.85, "L", 0.62, "H", 0.27)
        );
        Double userInteraction = metricValue(metrics, "UI", Map.of("N", 0.85, "R", 0.62));
        Double confidentiality = metricValue(metrics, "C", Map.of("H", 0.56, "L", 0.22, "N", 0.0));
        Double integrity = metricValue(metrics, "I", Map.of("H", 0.56, "L", 0.22, "N", 0.0));
        Double availability = metricValue(metrics, "A", Map.of("H", 0.56, "L", 0.22, "N", 0.0));
        if (scope == null || !(scope.equals("U") || scope.equals("C"))
                || attackVector == null || attackComplexity == null || privilegesRequired == null
                || userInteraction == null || confidentiality == null || integrity == null || availability == null) {
            return Optional.empty();
        }

        double impactSubScore = 1 - ((1 - confidentiality) * (1 - integrity) * (1 - availability));
        double impact = "U".equals(scope)
                ? 6.42 * impactSubScore
                : 7.52 * (impactSubScore - 0.029) - 3.25 * Math.pow(impactSubScore - 0.02, 15);
        if (impact <= 0) {
            return Optional.of(BigDecimal.ZERO.setScale(1));
        }

        double exploitability = 8.22 * attackVector * attackComplexity * privilegesRequired * userInteraction;
        double baseScore = "U".equals(scope)
                ? Math.min(impact + exploitability, 10)
                : Math.min(1.08 * (impact + exploitability), 10);
        double roundedScore = Math.ceil((baseScore - 1e-10) * 10) / 10;
        return Optional.of(BigDecimal.valueOf(roundedScore).setScale(1, RoundingMode.UNNECESSARY));
    }

    private static Double metricValue(Map<String, String> metrics, String name, Map<String, Double> values) {
        String metric = metrics.get(name);
        return metric == null ? null : values.get(metric);
    }
}
