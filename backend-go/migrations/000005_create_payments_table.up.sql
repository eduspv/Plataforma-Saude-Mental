CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    checkout_session_id UUID,

    provider VARCHAR(50) NOT NULL,
    provider_payment_id VARCHAR(255),

    status VARCHAR(40) NOT NULL DEFAULT 'pending',

    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',

    payment_method VARCHAR(50),

    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,

    failure_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT payments_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT payments_company_id_fk FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE RESTRICT,

    CONSTRAINT payments_plan_id_fk FOREIGN KEY (plan_id)
        REFERENCES plans(id)
        ON DELETE RESTRICT,

    CONSTRAINT payments_checkout_session_id_fk FOREIGN KEY (checkout_session_id)
        REFERENCES checkout_sessions(id)
        ON DELETE SET NULL,

    CONSTRAINT payments_amount_check CHECK (amount_cents >= 0),

    CONSTRAINT payments_status_check CHECK (
        status IN (
            'pending',
            'paid',
            'failed',
            'cancelled',
            'refunded'
        )
    )
);