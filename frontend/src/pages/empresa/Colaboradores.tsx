import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Button from "../../components/ui/Button";

type Employee = {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
};

export default function Colaboradores() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/v1/users/list-employees");
      setEmployees(response.data.data.all_company_employee ?? []);
    } catch {
      setError("Não foi possível carregar os colaboradores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleDeactivate(id: string) {
    setDeactivatingId(id);
    setError("");

    try {
      await api.patch(`/api/v1/users/${id}/deactivate`);
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === id ? { ...employee, status: "inactive" } : employee
        )
      );
    } catch {
      setError("Não foi possível desativar o colaborador.");
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
        <Link
          to="/empresa/colaboradores/novo"
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Novo colaborador
        </Link>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : employees.length === 0 ? (
          <EmptyState>Nenhum colaborador cadastrado ainda.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => {
                  const isInactive = employee.status === "inactive";
                  return (
                    <tr key={employee.id} className={isInactive ? "opacity-50" : ""}>
                      <td className="px-4 py-3 text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {employee.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            isInactive
                              ? "bg-gray-100 text-gray-500"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isInactive ? "Inativo" : employee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          loading={deactivatingId === employee.id}
                          disabled={isInactive}
                          onClick={() => handleDeactivate(employee.id)}
                        >
                          Desativar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
