import { Link, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";

export default function ColaboradorDetalhe() {
  const { id } = useParams();

  return (
    <div>
      <Link
        to="/empresa/colaboradores"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        &larr; Voltar para colaboradores
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Colaborador #{id}
      </h1>

      {/* TODO: GET /api/v1/users/{id} */}
      <Card className="mt-6 max-w-lg">
        <p className="text-sm font-medium text-gray-500">Nome</p>
        <p className="mt-1 text-gray-400">—</p>

        <p className="mt-4 text-sm font-medium text-gray-500">E-mail</p>
        <p className="mt-1 text-gray-400">—</p>

        <p className="mt-4 text-sm font-medium text-gray-500">
          Última classificação
        </p>
        <p className="mt-1 text-gray-400">—</p>
      </Card>
    </div>
  );
}
