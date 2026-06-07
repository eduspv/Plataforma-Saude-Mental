CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    description TEXT,

    price_cents INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',

    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',

    max_employees INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT plans_name_unique UNIQUE (name),

    CONSTRAINT plans_price_check CHECK (price_cents >= 0),

    CONSTRAINT plans_billing_cycle_check CHECK (
        billing_cycle IN (
            'monthly',
            'yearly'
        )
    )
);