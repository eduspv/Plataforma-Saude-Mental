import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../../lib/api";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

type FormState = {
  nome: string;
  email: string;
  cpf: string;
  password: string;
  aceitaTermos: boolean;
  aceitaPrivacidade: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  nome: "",
  email: "",
  cpf: "",
  password: "",
  aceitaTermos: false,
  aceitaPrivacidade: false,
};

export default function ColaboradorNovo() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!form.nome.trim()) newErrors.nome = "Informe o nome.";

    if (!form.email.trim()) {
      newErrors.email = "Informe o e-mail.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Informe um e-mail válido.";
    }

    if (!form.cpf.trim()) newErrors.cpf = "Informe o CPF.";

    if (!form.password) {
      newErrors.password = "Informe a senha inicial.";
    } else if (form.password.length < 8) {
      newErrors.password = "A senha deve ter no mínimo 8 caracteres.";
    }

    if (!form.aceitaTermos) {
      newErrors.aceitaTermos = "É preciso aceitar os termos de uso.";
    }

    if (!form.aceitaPrivacidade) {
      newErrors.aceitaPrivacidade = "É preciso aceitar a política de privacidade.";
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

    try {
      await api.post("/api/v1/users/create-employee", {
        name: form.nome,
        email: form.email,
        cpf: form.cpf,
        password: form.password,
        accepted_terms: form.aceitaTermos,
        accepted_privacy_policy: form.aceitaPrivacidade,
      });

      navigate("/empresa/colaboradores");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const message = err.response.data?.message
            ?? "Não foi possível cadastrar o colaborador.";
          setSubmitError(message);
        } else if (err.request) {
          setSubmitError("Não foi possível conectar ao servidor. Verifique sua conexão.");
        } else {
          setSubmitError("Erro inesperado. Tente novamente.");
        }
      } else {
        setSubmitError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        to="/empresa/colaboradores"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        &larr; Voltar para colaboradores
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Novo colaborador
      </h1>

      <Card className="mt-6 max-w-lg">
        {submitError && (
          <div className="mb-5">
            <ErrorMessage>{submitError}</ErrorMessage>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <Label htmlFor="nome">Nome</Label>
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
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              hasError={!!errors.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={form.cpf}
              hasError={!!errors.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
            />
            {errors.cpf && (
              <p className="mt-1.5 text-xs text-red-600">{errors.cpf}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Senha inicial</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              hasError={!!errors.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                checked={form.aceitaTermos}
                onChange={(e) =>
                  handleChange("aceitaTermos", e.target.checked)
                }
              />
              <span>
                Li e aceito os{" "}
                <Link
                  to="/termos"
                  target="_blank"
                  className="font-medium text-blue-700 hover:underline"
                >
                  termos de uso
                </Link>
              </span>
            </label>
            {errors.aceitaTermos && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.aceitaTermos}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                checked={form.aceitaPrivacidade}
                onChange={(e) =>
                  handleChange("aceitaPrivacidade", e.target.checked)
                }
              />
              <span>
                Li e aceito a{" "}
                <Link
                  to="/privacidade"
                  target="_blank"
                  className="font-medium text-blue-700 hover:underline"
                >
                  política de privacidade
                </Link>
              </span>
            </label>
            {errors.aceitaPrivacidade && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.aceitaPrivacidade}
              </p>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Cadastrar colaborador
          </Button>
        </form>
      </Card>
    </div>
  );
}
