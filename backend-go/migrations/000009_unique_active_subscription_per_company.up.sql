CREATE UNIQUE INDEX one_active_subscription_per_company
ON subscriptions (company_id)
WHERE status = 'active';