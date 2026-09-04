import { Link } from "react-router-dom";

export default function PagamentoSucesso() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-blue-700">Pagamento aprovado</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        Sua assinatura foi confirmada
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        O pagamento foi aprovado com sucesso. Você já pode acessar o painel da
        sua empresa.
      </p>

      <Link
        to="/login"
        className="mt-6 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Ir para o login
      </Link>
    </main>
  );
}
