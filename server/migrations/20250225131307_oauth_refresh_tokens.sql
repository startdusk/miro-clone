-- Add migration script here
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
    id varchar(100) NOT NULL PRIMARY KEY,
    access_token_id varchar(100) NOT NULL,
    revoked boolean NOT NULL,
    expires_at timestamp NULL
);

CREATE INDEX oauth_refresh_tokens_access_token_id_index ON oauth_refresh_tokens(access_token_id);