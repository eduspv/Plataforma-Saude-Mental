import EmptyState from "../../components/ui/EmptyState";

export default function Pagamentos() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>

      {/* TODO: GET endpoint de listagem de pagamentos (ainda não definido) */}
      <div className="mt-6">
        <EmptyState>Nenhum pagamento encontrado.</EmptyState>
      </div>
    </div>
  );
}
