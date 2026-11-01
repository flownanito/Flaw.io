CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    repository_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE dependencies (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    ecosystem VARCHAR(20) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    version VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_dependency_project_package UNIQUE (project_id, ecosystem, package_name)
);

CREATE TABLE vulnerabilities (
    id BIGSERIAL PRIMARY KEY,
    cve_id VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    ecosystem VARCHAR(20) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    vulnerable_versions VARCHAR(200) NOT NULL,
    patched_version VARCHAR(100),
    cvss_score NUMERIC(3, 1) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(30) NOT NULL,
    CONSTRAINT ck_vulnerability_cvss CHECK (cvss_score >= 0 AND cvss_score <= 10)
);

CREATE INDEX idx_dependencies_package ON dependencies (ecosystem, package_name);
CREATE INDEX idx_vulnerabilities_published_at ON vulnerabilities (published_at DESC);
