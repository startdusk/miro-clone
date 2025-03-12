-- Add migration script here

CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id bigserial PRIMARY KEY,
    tokenable_id BIGINT NOT NULL,
    tokenable_type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
