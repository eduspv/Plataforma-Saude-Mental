import { Link, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";

export default function EmpresaDetalhe() {
  const { id } = useParams();

  return (
    <div>
      <Link
        to="/admin/empresas"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        &larr; Voltar para empresas
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Empresa #{id}
      </h1>

      {/* TODO: GET endpoint de detalhe da empresa (ainda não definido) */}
      <Card className="mt-6 max-w-lg">
        <p className="text-sm font-medium text-gray-500">Nome</p>
        <p className="mt-1 text-gray-400">—</p>

        <p className="mt-4 text-sm font-medium text-gray-500">CNPJ</p>
        <p className="mt-1 text-gray-400">—</p>

        <p className="mt-4 text-sm font-medium text-gray-500">
          Plano contratado
        </p>
        <p className="mt-1 text-gray-400">—</p>
      </Card>
    </div>
  );
}
