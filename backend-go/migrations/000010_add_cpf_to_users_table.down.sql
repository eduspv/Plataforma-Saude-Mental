DROP INDEX IF EXISTS users_company_cpf_unique;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_employee_cpf_required_check;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_cpf_format_check;

ALTER TABLE users
DROP COLUMN IF EXISTS cpf;