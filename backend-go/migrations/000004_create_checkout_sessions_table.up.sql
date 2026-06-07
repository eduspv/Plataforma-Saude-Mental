CREATE TABLE IF NOT EXISTS checkout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    plan_id UUID NOT NULL,

    provider VARCHAR(50) NOT NULL,
    provider_session_id VARCHAR(255),

    status VARCHAR(40) NOT NULL DEFAULT 'pending',

    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',

    checkout_url TEXT,

    expires_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT checkout_sessions_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT checkout_sessions_company_id_fk FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE RESTRICT,

    CONSTRAINT checkout_sessions_plan_id_fk FOREIGN KEY (plan_id)
        REFERENCES plans(id)
        ON DELETE RESTRICT,

    CONSTRAINT checkout_sessions_amount_check CHECK (amount_cents >= 0),

    CONSTRAINT checkout_sessions_status_check CHECK (
        status IN (
            'pending',
            'paid',
            'expired',
            'cancelled',
            'failed'
        )
    )
);