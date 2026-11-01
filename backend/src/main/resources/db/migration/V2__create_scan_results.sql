CREATE TABLE scan_findings (
    id BIGSERIAL PRIMARY KEY,
    dependency_id BIGINT NOT NULL REFERENCES dependencies (id) ON DELETE CASCADE,
    advisory_id VARCHAR(100) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    vulnerable_versions TEXT NOT NULL,
    patched_version VARCHAR(100),
    cvss_score NUMERIC(3, 1),
    severity VARCHAR(20) NOT NULL,
    published_at TIMESTAMPTZ,
    reference_url VARCHAR(1000),
    CONSTRAINT uq_scan_finding_dependency_advisory UNIQUE (dependency_id, advisory_id),
    CONSTRAINT ck_scan_finding_cvss CHECK (cvss_score IS NULL OR (cvss_score >= 0 AND cvss_score <= 10))
);

CREATE INDEX idx_scan_findings_published_at ON scan_findings (published_at DESC);

CREATE TABLE analysis_runs (
    id BIGINT PRIMARY KEY CHECK (id = 1),
    scanned_at TIMESTAMPTZ NOT NULL,
    dependency_count INTEGER NOT NULL,
    finding_count INTEGER NOT NULL,
    input_fingerprint VARCHAR(64) NOT NULL
);
