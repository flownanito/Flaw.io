package io.flaw.vulnerabilities.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class VersionRangeMatcherTest {

    private final VersionRangeMatcher matcher = new VersionRangeMatcher();

    @Test
    void matchesVersionsBelowAnExclusiveUpperBound() {
        assertTrue(matcher.matches("2.14.1", "< 2.15.0"));
        assertFalse(matcher.matches("2.15.0", "< 2.15.0"));
    }

    @Test
    void matchesAllClausesInACommaSeparatedRange() {
        assertTrue(matcher.matches("5.3.19", ">= 5.3.0, < 5.3.20"));
        assertFalse(matcher.matches("5.3.20", ">= 5.3.0, < 5.3.20"));
    }

    @Test
    void doesNotClaimToUnderstandNonNumericVersionsOrRanges() {
        assertFalse(matcher.matches("5.3.19-RC1", "< 5.3.20"));
        assertFalse(matcher.matches("5.3.19", "5.3.x"));
    }
}
