import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-sm font-semibold text-blue-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        Página não encontrada
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        O endereço acessado não existe ou foi removido.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
