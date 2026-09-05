import { Link } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState";

export default function Planos() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
        <Link
          to="/admin/planos/novo"
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Novo plano
        </Link>
      </div>

      {/* TODO: GET endpoint de listagem de planos (ainda não definido) */}
      <div className="mt-6">
        <EmptyState>Nenhum plano cadastrado ainda.</EmptyState>
      </div>
    </div>
  );
}
