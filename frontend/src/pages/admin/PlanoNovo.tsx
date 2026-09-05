import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

type FormState = {
  nome: string;
  limiteColaboradores: string;
  preco: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  nome: "",
  limiteColaboradores: "",
  preco: "",
};

export default function PlanoNovo() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!form.nome.trim()) newErrors.nome = "Informe o nome do plano.";

    if (!form.limiteColaboradores.trim()) {
      newErrors.limiteColaboradores = "Informe o limite de colaboradores.";
    }

    if (!form.preco.trim()) newErrors.preco = "Informe o preço.";

    return newErrors;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    console.log("Criar plano:", form);
    // TODO: POST endpoint de criação de plano (ainda não definido)
    setLoading(false);
  }

  return (
    <div>
      <Link
        to="/admin/planos"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        &larr; Voltar para planos
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">Novo plano</h1>

      <Card className="mt-6 max-w-lg">
        {submitError && (
          <div className="mb-5">
            <ErrorMessage>{submitError}</ErrorMessage>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <Label htmlFor="nome">Nome do plano</Label>
            <Input
              id="nome"
              value={form.nome}
              hasError={!!errors.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
            />
            {errors.nome && (
              <p className="mt-1.5 text-xs text-red-600">{errors.nome}</p>
            )}
          </div>

          <div>
            <Label htmlFor="limiteColaboradores">
              Limite de colaboradores
            </Label>
            <Input
              id="limiteColaboradores"
              type="number"
              value={form.limiteColaboradores}
              hasError={!!errors.limiteColaboradores}
              onChange={(e) =>
                handleChange("limiteColaboradores", e.target.value)
              }
            />
            {errors.limiteColaboradores && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.limiteColaboradores}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              value={form.preco}
              hasError={!!errors.preco}
              onChange={(e) => handleChange("preco", e.target.value)}
            />
            {errors.preco && (
              <p className="mt-1.5 text-xs text-red-600">{errors.preco}</p>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Criar plano
          </Button>
        </form>
      </Card>
    </div>
  );
}
