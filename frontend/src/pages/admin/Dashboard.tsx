import Card from "../../components/ui/Card";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Visão geral da plataforma
      </h1>

      {/* TODO: GET endpoint de indicadores gerais da plataforma (ainda não definido) */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-gray-500">Empresas ativas</p>
          <p className="mt-2 text-lg font-semibold text-gray-400">—</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Usuários totais</p>
          <p className="mt-2 text-lg font-semibold text-gray-400">—</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">
            Assinaturas ativas
          </p>
          <p className="mt-2 text-lg font-semibold text-gray-400">—</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">
            Pagamentos no período
          </p>
          <p className="mt-2 text-lg font-semibold text-gray-400">—</p>
        </Card>
      </div>
    </div>
  );
}
