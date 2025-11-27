CREATE TABLE IF NOT EXISTS companies (
    company_id UUID PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    billing_email VARCHAR(255),
    flag SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_companies_flag CHECK (flag IN (0, 1, 9))
);

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    login_id VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    flag SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_flag CHECK (flag IN (0, 1, 9))
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_company
        FOREIGN KEY (company_id) REFERENCES companies (company_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_company_login
    ON users (company_id, login_id);

CREATE INDEX IF NOT EXISTS idx_users_company_id
    ON users (company_id);

CREATE TABLE IF NOT EXISTS role_mst (
    role_id SMALLINT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name_ja VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order SMALLINT,
    CONSTRAINT ux_role_mst_code UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_role_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role_id SMALLINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES role_mst (role_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_roles_user_role
    ON user_roles (user_id, role_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
    ON user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id
    ON user_roles (role_id);
