import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

type FormState = {
  nomeEmpresa: string;
  cnpj: string;
  emailCorporativo: string;
  telefone: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  nomeEmpresa: "",
  cnpj: "",
  emailCorporativo: "",
  telefone: "",
};

export default function EmpresaNova() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!form.nomeEmpresa.trim())
      newErrors.nomeEmpresa = "Informe o nome da empresa.";

    if (!form.cnpj.trim()) newErrors.cnpj = "Informe o CNPJ.";

    if (!form.emailCorporativo.trim()) {
      newErrors.emailCorporativo = "Informe o e-mail corporativo.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.emailCorporativo)) {
      newErrors.emailCorporativo = "Informe um e-mail válido.";
    }

    if (!form.telefone.trim()) newErrors.telefone = "Informe o telefone.";

    return newErrors;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    console.log("Cadastro manual de empresa:", form);
    // TODO: POST endpoint de cadastro manual de empresa (ainda não definido)
    setLoading(false);
  }

  return (
    <div>
      <Link
        to="/admin/empresas"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        &larr; Voltar para empresas
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">Nova empresa</h1>

      <Card className="mt-6 max-w-lg">
        {submitError && (
          <div className="mb-5">
            <ErrorMessage>{submitError}</ErrorMessage>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <Label htmlFor="nomeEmpresa">Nome da empresa</Label>
            <Input
              id="nomeEmpresa"
              value={form.nomeEmpresa}
              hasError={!!errors.nomeEmpresa}
              onChange={(e) => handleChange("nomeEmpresa", e.target.value)}
            />
            {errors.nomeEmpresa && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.nomeEmpresa}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={form.cnpj}
              hasError={!!errors.cnpj}
              onChange={(e) => handleChange("cnpj", e.target.value)}
            />
            {errors.cnpj && (
              <p className="mt-1.5 text-xs text-red-600">{errors.cnpj}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emailCorporativo">E-mail corporativo</Label>
            <Input
              id="emailCorporativo"
              type="email"
              value={form.emailCorporativo}
              hasError={!!errors.emailCorporativo}
              onChange={(e) =>
                handleChange("emailCorporativo", e.target.value)
              }
            />
            {errors.emailCorporativo && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.emailCorporativo}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={form.telefone}
              hasError={!!errors.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
            />
            {errors.telefone && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.telefone}
              </p>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Cadastrar empresa
          </Button>
        </form>
      </Card>
    </div>
  );
}
