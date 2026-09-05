import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import ErrorMessage from "../../components/ui/ErrorMessage";

export type Plan = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_cycle: string;
  max_employees: number;
  features: string[];
};

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/v1/plans/all-active");
        if (!cancelled) {
          setPlans(response.data.plans);
        }
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar os planos. Tente novamente.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Nossos planos</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
        Escolha o plano de acordo com o número de colaboradores da sua
        empresa.
      </p>

      {error && (
        <div className="mt-6">
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-gray-500">Carregando planos...</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <p className="text-sm font-medium text-gray-500">
                {plan.name}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Até {plan.max_employees} colaboradores
              </p>

              <p className="mt-3 text-lg font-semibold text-gray-900">
                {formatPrice(plan.price_cents, plan.currency)}
              </p>

              <Link
                to={`/plano/${plan.id}`}
                state={{ plan }}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Ver detalhes
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-xs leading-6 text-gray-500">
        A plataforma realiza uma triagem inicial de apoio e organização. Os
        resultados não substituem avaliação médica, psicológica ou
        psiquiátrica profissional.
      </p>
    </main>
  );
}
