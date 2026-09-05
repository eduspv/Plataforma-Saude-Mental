import { Link } from "react-router-dom";

export default function PagamentoPendente() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-amber-600">
        Pagamento em análise
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        Estamos processando seu pagamento
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        O pagamento está em análise. Você será notificado assim que a
        confirmação for concluída.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
