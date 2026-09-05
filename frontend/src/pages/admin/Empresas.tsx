import { Link } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState";

export default function Empresas() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <Link
          to="/admin/empresas/nova"
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Nova empresa
        </Link>
      </div>

      {/* TODO: GET endpoint de listagem de empresas (ainda não definido) */}
      <div className="mt-6">
        <EmptyState>Nenhuma empresa cadastrada ainda.</EmptyState>
      </div>
    </div>
  );
}
