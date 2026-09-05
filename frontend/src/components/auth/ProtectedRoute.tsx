import { Navigate, Outlet } from "react-router-dom";

type ProtectedRouteProps = {
  allowedRoles: string[];
};

// Guard de UX/roteamento apenas. A autorização real acontece no backend
// (JWT + RequireRole + isolamento por company_id) — este componente só
// decide qual tela tentar mostrar, nunca concede acesso a dados.
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
