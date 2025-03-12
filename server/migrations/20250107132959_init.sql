CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    remember_token VARCHAR(100) NULL,
    password VARCHAR(255) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE INDEX IF NOT EXISTS users_email_index ON users(email);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    payload TEXT NOT NULL,
    last_activity BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_last_activity_index ON sessions(last_activity);

CREATE TABLE IF NOT EXISTS cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner TEXT NOT NULL,
    expiration TIMESTAMP
);
