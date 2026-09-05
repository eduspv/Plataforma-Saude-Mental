import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import ErrorMessage from "../../components/ui/ErrorMessage";
import type { Plan } from "./PlanosPage";

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

export default function PlanoDetalhePage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const planFromState = (location.state as { plan?: Plan } | null)?.plan;

  const [plan, setPlan] = useState<Plan | null>(planFromState ?? null);
  const [loading, setLoading] = useState(!planFromState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (planFromState) return;

    let cancelled = false;

    async function loadPlan() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/v1/plans/all-active");
        if (cancelled) return;

        const found = (response.data.plans as Plan[]).find(
          (p) => p.id === id
        );

        if (!found) {
          setError("Plano não encontrado.");
        } else {
          setPlan(found);
        }
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar o plano. Tente novamente.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlan();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        to="/planos"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        &larr; Voltar para planos
      </Link>

      {loading ? (
        <p className="mt-10 text-sm text-gray-500">Carregando plano...</p>
      ) : error || !plan ? (
        <div className="mt-6">
          <ErrorMessage>{error || "Plano não encontrado."}</ErrorMessage>
        </div>
      ) : (
        <>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {plan.name}
          </h1>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Capacidade</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              Até {plan.max_employees} colaboradores
            </p>

            <p className="mt-4 text-sm text-gray-600">{plan.description}</p>

            <p className="mt-4 text-2xl font-semibold text-gray-900">
              {formatPrice(plan.price_cents, plan.currency)}
            </p>

            <button
              onClick={() =>
                navigate("/pagamento", { state: { planId: plan.id } })
              }
              className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Contratar plano
            </button>
          </div>
        </>
      )}
    </main>
  );
}
