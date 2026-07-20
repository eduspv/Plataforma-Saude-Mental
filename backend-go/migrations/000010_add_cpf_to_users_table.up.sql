ALTER TABLE users
ADD COLUMN cpf VARCHAR(11);

ALTER TABLE users
ADD CONSTRAINT users_cpf_format_check
CHECK (
    cpf IS NULL
    OR cpf ~ '^[0-9]{11}$'
);

ALTER TABLE users
ADD CONSTRAINT users_employee_cpf_required_check
CHECK (
    role <> 'EMPLOYEE'
    OR cpf IS NOT NULL
) NOT VALID;

CREATE UNIQUE INDEX users_company_cpf_unique
ON users (company_id, cpf)
WHERE cpf IS NOT NULL;