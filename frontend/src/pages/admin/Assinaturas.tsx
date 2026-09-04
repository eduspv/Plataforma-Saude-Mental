import EmptyState from "../../components/ui/EmptyState";

export default function Assinaturas() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Assinaturas ativas
      </h1>

      {/* TODO: GET endpoint de listagem de assinaturas (ainda não definido) */}
      <div className="mt-6">
        <EmptyState>Nenhuma assinatura encontrada.</EmptyState>
      </div>
    </div>
  );
}
