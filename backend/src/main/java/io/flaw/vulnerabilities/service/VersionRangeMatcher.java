package io.flaw.vulnerabilities.service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class VersionRangeMatcher {

    private static final Pattern SIMPLE_RANGE = Pattern.compile("^(<|<=|>|>=)\\s*v?(\\d+(?:\\.\\d+)*)$");
    private static final Pattern NUMERIC_VERSION = Pattern.compile("^v?\\d+(?:\\.\\d+)*$");

    public boolean matches(String version, String range) {
        if (!NUMERIC_VERSION.matcher(version).matches()) {
            return false;
        }
        List<String> clauses = Arrays.stream(range.split(","))
                .map(String::trim)
                .toList();
        if (clauses.isEmpty()) {
            return false;
        }
        return clauses.stream().allMatch(clause -> matchesClause(version, clause));
    }

    private boolean matchesClause(String version, String clause) {
        Matcher matcher = SIMPLE_RANGE.matcher(clause);
        if (!matcher.matches()) {
            return false;
        }
        int comparison = compare(version, matcher.group(2));
        return switch (matcher.group(1)) {
            case "<" -> comparison < 0;
            case "<=" -> comparison <= 0;
            case ">" -> comparison > 0;
            case ">=" -> comparison >= 0;
            default -> false;
        };
    }

    private int compare(String first, String second) {
        String[] firstParts = first.replaceFirst("^v", "").split("\\.");
        String[] secondParts = second.replaceFirst("^v", "").split("\\.");
        int length = Math.max(firstParts.length, secondParts.length);
        for (int index = 0; index < length; index++) {
            int left = index < firstParts.length ? Integer.parseInt(firstParts[index]) : 0;
            int right = index < secondParts.length ? Integer.parseInt(secondParts[index]) : 0;
            int result = Integer.compare(left, right);
            if (result != 0) {
                return result;
            }
        }
        return 0;
    }
}
