import { useState } from "react";
import type { SubmitEvent } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

type FormState = {
  nomePlataforma: string;
  emailSuporte: string;
};

const initialState: FormState = {
  nomePlataforma: "",
  emailSuporte: "",
};

export default function Configuracoes() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setSubmitError("");
    setLoading(true);
    console.log("Atualizar configurações globais:", form);
    // TODO: GET endpoint de configurações globais (ainda não definido)
    // TODO: PUT endpoint de configurações globais (ainda não definido)
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Configurações globais
      </h1>

      <Card className="mt-6 max-w-lg">
        {submitError && (
          <div className="mb-5">
            <ErrorMessage>{submitError}</ErrorMessage>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <Label htmlFor="nomePlataforma">Nome da plataforma</Label>
            <Input
              id="nomePlataforma"
              value={form.nomePlataforma}
              onChange={(e) =>
                handleChange("nomePlataforma", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="emailSuporte">E-mail de suporte</Label>
            <Input
              id="emailSuporte"
              type="email"
              value={form.emailSuporte}
              onChange={(e) => handleChange("emailSuporte", e.target.value)}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Salvar alterações
          </Button>
        </form>
      </Card>
    </div>
  );
}
