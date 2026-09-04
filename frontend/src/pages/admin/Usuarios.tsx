import EmptyState from "../../components/ui/EmptyState";

export default function Usuarios() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
      <p className="mt-2 text-sm text-gray-600">
        Lista de usuários de todos os perfis da plataforma.
      </p>

      {/* TODO: GET endpoint de listagem de usuários (ainda não definido) */}
      <div className="mt-6">
        <EmptyState>Nenhum usuário encontrado.</EmptyState>
      </div>
    </div>
  );
}
