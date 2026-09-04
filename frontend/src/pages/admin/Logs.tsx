import EmptyState from "../../components/ui/EmptyState";

export default function Logs() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Logs de auditoria
      </h1>

      {/* TODO: GET endpoint de logs de auditoria (ainda não definido) */}
      <div className="mt-6">
        <EmptyState>Nenhum registro de log disponível.</EmptyState>
      </div>
    </div>
  );
}
