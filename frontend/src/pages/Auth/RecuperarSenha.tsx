import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setSubmitError("");
    setError("");

    if (!email.trim()) {
      setError("Informe o e-mail.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setLoading(true);
    console.log("Recuperar senha submit:", { email });
    // TODO: POST /api/v1/auth/forgot-password
    setLoading(false);
    setEnviado(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">
          Recuperar senha
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Informe o e-mail cadastrado para receber as instruções de
          recuperação de senha.
        </p>

        <Card className="mt-6">
          {submitError && (
            <div className="mb-5">
              <ErrorMessage>{submitError}</ErrorMessage>
            </div>
          )}

          {enviado ? (
            <p className="text-sm text-gray-700">
              Se o e-mail informado estiver cadastrado, você receberá as
              instruções de recuperação em instantes.
            </p>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  hasError={!!error}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && (
                  <p className="mt-1.5 text-xs text-red-600">{error}</p>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full">
                Enviar instruções
              </Button>
            </form>
          )}
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
