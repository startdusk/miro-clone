-- Add migration script here
CREATE TABLE IF NOT EXISTS oauth_personal_access_clients (
    id bigserial PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);