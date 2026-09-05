CREATE TABLE IF NOT EXISTS diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    form_version INTEGER NOT NULL,
    scoring_version VARCHAR(20) NOT NULL DEFAULT 'det-v1',
    total_score INTEGER NOT NULL DEFAULT 0,
    step_scores JSONB,
    classification VARCHAR(60) NOT NULL,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    recommendation TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT diagnostic_tests_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT diagnostic_tests_company_id_fk FOREIGN KEY (company_id)
        REFERENCES companies(id) ON DELETE RESTRICT,
    CONSTRAINT diagnostic_tests_classification_check CHECK (classification IN (
        'apto',
        'apto_com_acompanhamento',
        'necessita_avaliacao_psicologica',
        'necessita_avaliacao_psiquiatrica',
        'necessita_avaliacao_psicologica_psiquiatrica',
        'risco_elevado',
        'risco_critico'
    )),
    CONSTRAINT diagnostic_tests_status_check CHECK (status IN ('in_progress','completed'))
);
CREATE INDEX idx_diagnostic_tests_user ON diagnostic_tests (user_id);
CREATE INDEX idx_diagnostic_tests_company ON diagnostic_tests (company_id);
CREATE INDEX idx_diagnostic_tests_user_created ON diagnostic_tests (user_id, created_at);