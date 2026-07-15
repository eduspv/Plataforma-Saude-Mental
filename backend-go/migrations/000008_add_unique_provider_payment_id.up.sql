-- Pre-check before applying: SELECT count(*) FROM payments WHERE provider_payment_id IS NULL;
-- If count > 0, clean or backfill those rows first — this ALTER will fail otherwise.
ALTER TABLE payments
    ALTER COLUMN provider_payment_id SET NOT NULL,
    ADD CONSTRAINT payments_provider_payment_id_unique UNIQUE (provider_payment_id);
