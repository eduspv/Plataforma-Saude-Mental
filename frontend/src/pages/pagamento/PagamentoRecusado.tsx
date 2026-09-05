import { Link } from "react-router-dom";

export default function PagamentoRecusado() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-red-600">Pagamento recusado</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        Não foi possível concluir o pagamento
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        O pagamento foi recusado. Verifique os dados informados ou tente
        novamente com outro método de pagamento.
      </p>

      <Link
        to="/pagamento"
        className="mt-6 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Tentar novamente
      </Link>
    </main>
  );
}
