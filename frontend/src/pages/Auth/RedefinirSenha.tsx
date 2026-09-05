import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

type FormState = {
  senha: string;
  confirmarSenha: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState<FormState>({
    senha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!form.senha) {
      newErrors.senha = "Informe a nova senha.";
    } else if (form.senha.length < 8) {
      newErrors.senha = "A senha deve ter no mínimo 8 caracteres.";
    }

    if (!form.confirmarSenha) {
      newErrors.confirmarSenha = "Confirme a nova senha.";
    } else if (form.confirmarSenha !== form.senha) {
      newErrors.confirmarSenha = "As senhas não coincidem.";
    }

    return newErrors;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    console.log("Redefinir senha submit:", { token, ...form });
    // TODO: POST /api/v1/auth/reset-password
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Redefinir senha</h1>
        <p className="mt-2 text-sm text-gray-600">
          Defina uma nova senha para sua conta.
        </p>

        <Card className="mt-6">
          {!token && (
            <div className="mb-5">
              <ErrorMessage>
                Token de redefinição não encontrado na URL.
              </ErrorMessage>
            </div>
          )}

          {submitError && (
            <div className="mb-5">
              <ErrorMessage>{submitError}</ErrorMessage>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                type="password"
                value={form.senha}
                hasError={!!errors.senha}
                onChange={(e) => handleChange("senha", e.target.value)}
              />
              {errors.senha && (
                <p className="mt-1.5 text-xs text-red-600">{errors.senha}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={form.confirmarSenha}
                hasError={!!errors.confirmarSenha}
                onChange={(e) =>
                  handleChange("confirmarSenha", e.target.value)
                }
              />
              {errors.confirmarSenha && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.confirmarSenha}
                </p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Redefinir senha
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-blue-700 hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  );
}
