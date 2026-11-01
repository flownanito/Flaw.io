package io.flaw.vulnerabilities.service;

import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.model.TrackedDependency;
import io.flaw.vulnerabilities.model.ScanFinding;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class OsvFindingMapper {

    private final VersionRangeMatcher versionRangeMatcher;

    public OsvFindingMapper(VersionRangeMatcher versionRangeMatcher) {
        this.versionRangeMatcher = versionRangeMatcher;
    }

    public Optional<ScanFinding> map(OsvData.OsvVulnerability vulnerability, TrackedDependency dependency) {
        List<OsvData.OsvAffected> affectedPackages = Optional.ofNullable(vulnerability.affected())
                .orElse(List.of())
                .stream()
                .filter(affected -> isMatchingPackage(affected.packageInfo(), dependency))
                .toList();
        if (affectedPackages.isEmpty()) {
            return Optional.empty();
        }

        BigDecimal score = cvssScore(vulnerability);
        String id = Optional.ofNullable(vulnerability.aliases())
                .orElse(List.of())
                .stream()
                .filter(alias -> alias.startsWith("CVE-"))
                .findFirst()
                .orElse(vulnerability.id());
        String title = truncate(plainText(firstNonBlank(vulnerability.summary(), id)), 300);
        String fullDetails = fullDescription(vulnerability.details(), title);
        String description = conciseDescription(fullDetails, title);
        List<VersionRange> ranges = affectedPackages.stream()
                .flatMap(affected -> formatRanges(affected).stream())
                .distinct()
                .toList();
        String vulnerableVersions = ranges.stream()
                .map(VersionRange::display)
                .distinct()
                .reduce((first, second) -> first + " OR " + second)
                .orElse("Versión confirmada como afectada por OSV");
        String fixedVersion = ranges.stream()
                .filter(range -> matchesRange(dependency.getVersion(), range.display()))
                .map(VersionRange::fixedVersion)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
        String referenceUrl = Optional.ofNullable(vulnerability.references())
                .orElse(List.of())
                .stream()
                .filter(reference -> "ADVISORY".equalsIgnoreCase(reference.type()))
                .map(OsvData.OsvReference::url)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElse("https://osv.dev/vulnerability/" + vulnerability.id());

        return Optional.of(new ScanFinding(
                dependency,
                id,
                title,
                description,
                fullDetails,
                vulnerableVersions,
                fixedVersion,
                score,
                severity(score, vulnerability),
                vulnerability.published(),
                truncate(referenceUrl, 1000)
        ));
    }

    private boolean isMatchingPackage(OsvData.PackageInfo packageInfo, TrackedDependency dependency) {
        return packageInfo != null
                && packageInfo.name() != null
                && packageInfo.name().equalsIgnoreCase(dependency.getPackageName())
                && packageInfo.ecosystem() != null
                && packageInfo.ecosystem().equalsIgnoreCase(osvEcosystem(dependency.getEcosystem()));
    }

    private List<VersionRange> formatRanges(OsvData.OsvAffected affected) {
        List<VersionRange> result = new ArrayList<>();
        for (OsvData.OsvRange range : Optional.ofNullable(affected.ranges()).orElse(List.of())) {
            String introduced = null;
            for (OsvData.OsvEvent event : Optional.ofNullable(range.events()).orElse(List.of())) {
                if (event.introduced() != null) {
                    introduced = event.introduced();
                    continue;
                }
                String upperBound = event.fixed() != null ? event.fixed()
                        : event.lastAffected() != null ? event.lastAffected()
                        : event.limit();
                if (upperBound != null) {
                    boolean inclusive = event.lastAffected() != null;
                    String lowerBound = introduced == null || introduced.equals("0") || introduced.equals("0.0.0")
                            ? null : introduced;
                    result.add(new VersionRange(
                            lowerBound == null
                                    ? (inclusive ? "<= " : "< ") + upperBound
                                    : ">= " + lowerBound + (inclusive ? ", <= " : ", < ") + upperBound,
                            event.fixed()
                    ));
                    introduced = null;
                }
            }
            if (introduced != null) {
                result.add(new VersionRange(">= " + introduced, null));
            }
        }
        if (!result.isEmpty()) {
            return result;
        }
        return Optional.ofNullable(affected.versions())
                .filter(versions -> !versions.isEmpty())
                .map(versions -> List.of(new VersionRange("Versiones afectadas: " + String.join(", ", versions), null)))
                .orElse(List.of());
    }

    private boolean matchesRange(String version, String range) {
        return versionRangeMatcher.matches(version, range);
    }

    private BigDecimal cvssScore(OsvData.OsvVulnerability vulnerability) {
        for (OsvData.OsvSeverity severity : Optional.ofNullable(vulnerability.severity()).orElse(List.of())) {
            String score = severity.score();
            if (score == null || score.isBlank()) {
                continue;
            }
            if (score.matches("\\d+(\\.\\d+)?")) {
                BigDecimal numericScore = new BigDecimal(score);
                if (numericScore.compareTo(BigDecimal.ZERO) >= 0
                        && numericScore.compareTo(BigDecimal.TEN) <= 0) {
                    return numericScore;
                }
                continue;
            }
            if ("CVSS_V3".equalsIgnoreCase(severity.type())) {
                Optional<BigDecimal> calculatedScore = CvssV3Calculator.calculateBaseScore(score);
                if (calculatedScore.isPresent()) {
                    return calculatedScore.get();
                }
            }
        }
        return null;
    }

    private String severity(BigDecimal score, OsvData.OsvVulnerability vulnerability) {
        if (score != null) {
            if (score.compareTo(BigDecimal.valueOf(9)) >= 0) {
                return "CRITICAL";
            }
            if (score.compareTo(BigDecimal.valueOf(7)) >= 0) {
                return "HIGH";
            }
            if (score.compareTo(BigDecimal.valueOf(4)) >= 0) {
                return "MEDIUM";
            }
            return "LOW";
        }
        Object value = vulnerability.databaseSpecific() == null
                ? null
                : vulnerability.databaseSpecific().get("severity");
        if (value == null) {
            return "UNKNOWN";
        }
        return switch (value.toString().toUpperCase()) {
            case "CRITICAL" -> "CRITICAL";
            case "HIGH" -> "HIGH";
            case "MODERATE", "MEDIUM" -> "MEDIUM";
            case "LOW" -> "LOW";
            default -> "UNKNOWN";
        };
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

    private String firstNonBlank(String preferred, String fallback) {
        return preferred == null || preferred.isBlank() ? fallback : preferred;
    }

    private String conciseDescription(String details, String fallback) {
        String cleaned = plainText(firstNonBlank(details, fallback));
        if (cleaned.length() <= 280) {
            return cleaned;
        }
        int end = cleaned.lastIndexOf(' ', 279);
        return cleaned.substring(0, end > 0 ? end : 279).stripTrailing() + "…";
    }

    private String fullDescription(String details, String fallback) {
        String cleaned = firstNonBlank(details, fallback)
                .replaceAll("(?m)^#{1,6}\\s*", "")
                .replaceAll("\\[([^\\]]+)]\\(https?://[^)]+\\)", "$1")
                .replaceAll("`([^`]+)`", "$1")
                .replaceAll("\\*{1,2}", "")
                .replaceAll("(?m)^\\s*>+\\s*", "")
                .replaceAll("(?m)^\\s*[-*]\\s+", "• ")
                .replaceAll("\\r\\n?", "\n")
                .replaceAll("[\\t\\x0B\\f ]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
        return truncate(cleaned, 12_000) + (cleaned.length() > 12_000 ? "…" : "");
    }

    private String plainText(String value) {
        return value.replaceAll("(?m)^#{1,6}\\s*", "")
                .replaceAll("\\[([^\\]]+)]\\(https?://[^)]+\\)", "$1")
                .replaceAll("`([^`]+)`", "$1")
                .replaceAll("\\*{1,2}", "")
                .replaceAll("(?m)^\\s*>+\\s*", "")
                .replaceAll("(?m)^\\s*[-*]\\s+", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String truncate(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private record VersionRange(String display, String fixedVersion) {
    }
}
