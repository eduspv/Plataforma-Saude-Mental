CREATE TABLE IF NOT EXISTS diagnostic_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_version INTEGER NOT NULL DEFAULT 1,
    step SMALLINT NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    options JSONB,
    weight INTEGER NOT NULL DEFAULT 1,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT diagnostic_questions_type_check CHECK (type IN ('scale_1_5','yes_no','multiple_choice')),
    CONSTRAINT diagnostic_questions_weight_check CHECK (weight >= 0),
    CONSTRAINT diagnostic_questions_step_check CHECK (step >= 1)
);
CREATE INDEX idx_diagnostic_questions_version_active ON diagnostic_questions (form_version, is_active);