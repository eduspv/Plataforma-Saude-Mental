import { useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

export default function Pagamento() {
  const location = useLocation();
  const planId = (location.state as { planId?: string } | null)?.planId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutStarted, setCheckoutStarted] = useState(false);

  async function handleIniciarPagamento() {
    if (!planId) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/v1/checkout/create-session", {
        plan_id: planId,
        billing_type: "PIX",
        charge_type: "DETACHED",
      });

      const checkoutUrl = response.data.data.checkout_url;
      window.open(checkoutUrl, "_blank");
      setCheckoutStarted(true);
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const message: string | undefined = err.response.data?.message;

        if (err.response.status === 400 && message?.includes("permissão")) {
          setError(
            "Apenas o administrador da empresa pode contratar um plano."
          );
        } else if (
          err.response.status === 400 &&
          message?.includes("não pode iniciar checkout")
        ) {
          setError(
            "Checkout não disponível — sua empresa já tem acesso ativo. Faça login novamente."
          );
        } else if (
          err.response.status === 400 &&
          message?.includes("outro link de pagamento")
        ) {
          setError(
            "Você já tem links de pagamento pendentes. Utilize um dos links enviados anteriormente ou aguarde a confirmação."
          );
        } else {
          setError(message ?? "Não foi possível iniciar o pagamento.");
        }
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente.");
      }
      setLoading(false);
    }
  }

  if (checkoutStarted) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Pagamento iniciado
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Seu pagamento foi aberto em outra aba. Assim que concluir, faça
          login para acessar seu painel.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Ir para o login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Pagamento do plano
      </h1>
      <p className="mt-3 text-sm text-gray-600">
        Ao confirmar, você será direcionado para o ambiente de pagamento via
        PIX.
      </p>

      {!planId && (
        <div className="mt-6 text-left">
          <ErrorMessage>
            Nenhum plano selecionado. Volte para a página de planos e
            escolha um.
          </ErrorMessage>
          <Link
            to="/planos"
            className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline"
          >
            &larr; Voltar para planos
          </Link>
        </div>
      )}

      {error && (
        <div className="mt-6 text-left">
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      )}

      <Button
        onClick={handleIniciarPagamento}
        loading={loading}
        disabled={!planId}
        className="mt-8"
      >
        Ir para o pagamento
      </Button>
    </main>
  );
}
