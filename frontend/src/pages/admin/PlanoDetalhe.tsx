import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useParams } from "react-router-dom";
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

const initialState: FormState = {
  nome: "",
  limiteColaboradores: "",
  preco: "",
};

export default function PlanoDetalhe() {
  const { id } = useParams();
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
    console.log(`Atualizar plano ${id}:`, form);
    // TODO: GET endpoint de detalhe do plano {id} (ainda não definido)
    // TODO: PUT endpoint de atualização do plano {id} (ainda não definido)
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

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Editar plano #{id}
      </h1>

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
              onChange={(e) => handleChange("nome", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="limiteColaboradores">
              Limite de colaboradores
            </Label>
            <Input
              id="limiteColaboradores"
              type="number"
              value={form.limiteColaboradores}
              onChange={(e) =>
                handleChange("limiteColaboradores", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              value={form.preco}
              onChange={(e) => handleChange("preco", e.target.value)}
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
