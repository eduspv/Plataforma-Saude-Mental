ALTER TABLE payments
    DROP CONSTRAINT IF EXISTS payments_provider_payment_id_unique,
    ALTER COLUMN provider_payment_id DROP NOT NULL;
