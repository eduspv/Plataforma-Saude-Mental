import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout";

import Home from "./pages/Home";
import PlanosPage from "./pages/pagamento/PlanosPage";
import PlanoDetalhePage from "./pages/pagamento/PlanoDetalhePage";
import PagamentoPage from "./pages/pagamento/Pagamento";
import Login from "./pages/Auth/Login";
import Cadastro from "./pages/Auth/Cadastro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/planos" element={<PlanosPage />} />
            <Route path="/plano/:tipo" element={<PlanoDetalhePage />} />
            <Route path="/pagamento" element={<PagamentoPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}