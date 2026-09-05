CREATE UNIQUE INDEX uniq_diagnostic_test_user_day
    ON diagnostic_tests (
        user_id,
        ((created_at AT TIME ZONE 'America/Sao_Paulo')::date)
    );