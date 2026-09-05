import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout";
import CompanyLayout from "./components/layout/CompanyLayout";
import CollaboratorLayout from "./components/layout/CollaboratorLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Públicas
const Home = lazy(() => import("./pages/Home"));
const PlanosPage = lazy(() => import("./pages/pagamento/PlanosPage"));
const PlanoDetalhePage = lazy(() => import("./pages/pagamento/PlanoDetalhePage"));
const Pagamento = lazy(() => import("./pages/pagamento/Pagamento"));
const PagamentoSucesso = lazy(() => import("./pages/pagamento/PagamentoSucesso"));
const PagamentoPendente = lazy(() => import("./pages/pagamento/PagamentoPendente"));
const PagamentoRecusado = lazy(() => import("./pages/pagamento/PagamentoRecusado"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Cadastro = lazy(() => import("./pages/Auth/Cadastro"));
const RecuperarSenha = lazy(() => import("./pages/Auth/RecuperarSenha"));
const RedefinirSenha = lazy(() => import("./pages/Auth/RedefinirSenha"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Forbidden = lazy(() => import("./pages/Forbidden"));

// Empresa (COMPANY_ADMIN)
const EmpresaDashboard = lazy(() => import("./pages/empresa/Dashboard"));
const EmpresaColaboradores = lazy(() => import("./pages/empresa/Colaboradores"));
const EmpresaColaboradorNovo = lazy(() => import("./pages/empresa/ColaboradorNovo"));
const EmpresaColaboradorDetalhe = lazy(() => import("./pages/empresa/ColaboradorDetalhe"));
const EmpresaPlano = lazy(() => import("./pages/empresa/Plano"));
const EmpresaPagamentos = lazy(() => import("./pages/empresa/Pagamentos"));
const EmpresaRelatorios = lazy(() => import("./pages/empresa/Relatorios"));
const EmpresaConfiguracoes = lazy(() => import("./pages/empresa/Configuracoes"));
const EmpresaPerfil = lazy(() => import("./pages/empresa/Perfil"));

// Colaborador (COLLABORATOR)
const ColaboradorDashboard = lazy(() => import("./pages/colaborador/Dashboard"));
const ColaboradorDiagnostico = lazy(() => import("./pages/colaborador/Diagnostico"));
const ColaboradorResultado = lazy(() => import("./pages/colaborador/Resultado"));
const ColaboradorHistorico = lazy(() => import("./pages/colaborador/Historico"));
const ColaboradorPerfil = lazy(() => import("./pages/colaborador/Perfil"));

// Admin (SYSTEM_ADMIN)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEmpresas = lazy(() => import("./pages/admin/Empresas"));
const AdminEmpresaNova = lazy(() => import("./pages/admin/EmpresaNova"));
const AdminEmpresaDetalhe = lazy(() => import("./pages/admin/EmpresaDetalhe"));
const AdminUsuarios = lazy(() => import("./pages/admin/Usuarios"));
const AdminPlanos = lazy(() => import("./pages/admin/Planos"));
const AdminPlanoNovo = lazy(() => import("./pages/admin/PlanoNovo"));
const AdminPlanoDetalhe = lazy(() => import("./pages/admin/PlanoDetalhe"));
const AdminAssinaturas = lazy(() => import("./pages/admin/Assinaturas"));
const AdminPagamentos = lazy(() => import("./pages/admin/Pagamentos"));
const AdminLogs = lazy(() => import("./pages/admin/Logs"));
const AdminConfiguracoes = lazy(() => import("./pages/admin/Configuracoes"));

const queryClient = new QueryClient();

function PageLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Públicas */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/planos" element={<PlanosPage />} />
              <Route path="/plano/:tipo" element={<PlanoDetalhePage />} />
              <Route path="/pagamento" element={<Pagamento />} />
              <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
              <Route path="/pagamento/pendente" element={<PagamentoPendente />} />
              <Route path="/pagamento/recusado" element={<PagamentoRecusado />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/privacidade" element={<Privacidade />} />
            </Route>

            {/* Empresa (COMPANY_ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={["COMPANY_ADMIN", "SYSTEM_ADMIN"]} />}>
            <Route path="/empresa" element={<CompanyLayout />}>
              <Route path="dashboard" element={<EmpresaDashboard />} />
              <Route path="colaboradores" element={<EmpresaColaboradores />} />
              <Route
                path="colaboradores/novo"
                element={<EmpresaColaboradorNovo />}
              />
              <Route
                path="colaboradores/:id"
                element={<EmpresaColaboradorDetalhe />}
              />
              <Route path="plano" element={<EmpresaPlano />} />
              <Route path="plano/upgrade" element={<PlanosPage />} />
              <Route path="pagamentos" element={<EmpresaPagamentos />} />
              <Route path="relatorios" element={<EmpresaRelatorios />} />
              <Route path="configuracoes" element={<EmpresaConfiguracoes />} />
              <Route path="perfil" element={<EmpresaPerfil />} />
            </Route>
            </Route>

            {/* Colaborador (EMPLOYEE) */}
            <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE", "COMPANY_ADMIN", "SYSTEM_ADMIN"]} />}>
            <Route path="/colaborador" element={<CollaboratorLayout />}>
              <Route path="dashboard" element={<ColaboradorDashboard />} />
              <Route path="diagnostico" element={<ColaboradorDiagnostico />} />
              <Route path="resultado/:id" element={<ColaboradorResultado />} />
              <Route path="historico" element={<ColaboradorHistorico />} />
              <Route path="perfil" element={<ColaboradorPerfil />} />
            </Route>
            </Route>

            {/* Admin (SYSTEM_ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="empresas" element={<AdminEmpresas />} />
              <Route path="empresas/nova" element={<AdminEmpresaNova />} />
              <Route path="empresas/:id" element={<AdminEmpresaDetalhe />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="planos" element={<AdminPlanos />} />
              <Route path="planos/novo" element={<AdminPlanoNovo />} />
              <Route path="planos/:id" element={<AdminPlanoDetalhe />} />
              <Route path="assinaturas" element={<AdminAssinaturas />} />
              <Route path="pagamentos" element={<AdminPagamentos />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="configuracoes" element={<AdminConfiguracoes />} />
            </Route>
            </Route>

            {/* Comuns */}
            <Route path="/404" element={<NotFound />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
