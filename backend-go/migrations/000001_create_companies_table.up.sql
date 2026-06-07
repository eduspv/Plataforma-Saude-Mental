CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(180) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    corporate_email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),

    status VARCHAR(40) NOT NULL DEFAULT 'pending_plan_selection',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT companies_cnpj_unique UNIQUE (cnpj),
    CONSTRAINT companies_corporate_email_unique UNIQUE (corporate_email),

    CONSTRAINT companies_status_check CHECK (
        status IN (
            'pending_plan_selection',
            'pending_payment',
            'active',
            'blocked',
            'inactive'
        )
    )
);