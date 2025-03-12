-- Add migration script here
CREATE TABLE IF NOT EXISTS oauth_auth_codes (
    id VARCHAR(100) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    client_id UUID NOT NULL,
    scopes TEXT NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);
