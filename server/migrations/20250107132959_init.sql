CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    account_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    password VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_account_id_index ON users (account_id);
CREATE INDEX IF NOT EXISTS users_email_index ON users (email);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id bigserial NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    payload TEXT NOT NULL,
    last_activity TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_index ON sessions (user_id);

CREATE TABLE IF NOT EXISTS oauth_provider (
    provider_id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    name VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);