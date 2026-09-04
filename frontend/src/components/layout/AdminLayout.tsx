import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../../lib/auth";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Empresas", to: "/admin/empresas" },
  { label: "Usuários", to: "/admin/usuarios" },
  { label: "Planos", to: "/admin/planos" },
  { label: "Assinaturas", to: "/admin/assinaturas" },
  { label: "Pagamentos", to: "/admin/pagamentos" },
  { label: "Logs", to: "/admin/logs" },
  { label: "Configurações", to: "/admin/configuracoes" },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-900 md:flex">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <span className="text-sm font-semibold text-white">
            Administração
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <button
            onClick={logout}
            className="mt-auto rounded-lg border-t border-gray-800 px-3 py-2 pt-4 text-left text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Sair
          </button>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-sm font-semibold text-gray-500">
            Painel do sistema
          </span>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
