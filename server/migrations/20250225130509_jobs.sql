-- Add migration script here
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    reserved_at INT NULL,
    available_at INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL,
    pending_jobs INT NOT NULL,
    failed_jobs INT NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options TEXT NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,

    exception TEXT NOT NULL,
    failed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
