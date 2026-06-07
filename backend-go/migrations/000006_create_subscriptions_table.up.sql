CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL,
    plan_id UUID NOT NULL,

    last_payment_id UUID,

    provider VARCHAR(50),
    provider_subscription_id VARCHAR(255),

    status VARCHAR(40) NOT NULL DEFAULT 'active',

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,

    cancelled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subscriptions_company_id_fk FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE RESTRICT,

    CONSTRAINT subscriptions_plan_id_fk FOREIGN KEY (plan_id)
        REFERENCES plans(id)
        ON DELETE RESTRICT,

    CONSTRAINT subscriptions_last_payment_id_fk FOREIGN KEY (last_payment_id)
        REFERENCES payments(id)
        ON DELETE SET NULL,

    CONSTRAINT subscriptions_status_check CHECK (
        status IN (
            'active',
            'past_due',
            'cancelled',
            'expired',
            'inactive'
        )
    )
);