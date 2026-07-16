CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NULL,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash TEXT NOT NULL,

    role VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'pending_plan_selection',

    phone VARCHAR(20),

    accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_terms_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    accepted_privacy_policy BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_privacy_policy_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_unique UNIQUE (email),

    CONSTRAINT users_company_id_fk FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE RESTRICT,

    CONSTRAINT users_role_check CHECK (
        role IN (
            'SYSTEM_ADMIN',
            'COMPANY_ADMIN',
            'EMPLOYEE'
        )
    ),

    CONSTRAINT users_status_check CHECK (
        status IN (
            'pending_plan_selection',
            'pending_payment',
            'active',
            'blocked',
            'inactive'
        )
    )
);