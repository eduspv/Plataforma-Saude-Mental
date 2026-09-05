CREATE TABLE IF NOT EXISTS diagnostic_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_test_id UUID NOT NULL,
    question_id UUID NOT NULL,
    answer_value TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT diagnostic_answers_test_fk FOREIGN KEY (diagnostic_test_id)
        REFERENCES diagnostic_tests(id) ON DELETE CASCADE,
    CONSTRAINT diagnostic_answers_question_fk FOREIGN KEY (question_id)
        REFERENCES diagnostic_questions(id) ON DELETE RESTRICT,
    CONSTRAINT diagnostic_answers_unique_per_test UNIQUE (diagnostic_test_id, question_id)
);
CREATE INDEX idx_diagnostic_answers_test ON diagnostic_answers (diagnostic_test_id);
CREATE INDEX idx_diagnostic_answers_question ON diagnostic_answers (question_id);