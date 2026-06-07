import { Link } from "react-router-dom";
import logoSemFundo from "../../assets/logo/logosasgrande-semfundo.png";

export default function Cadastro() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <section className="grid min-h-screen lg:grid-cols-2">
        {/* Lado esquerdo */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#047CAB] via-[#159A8D] to-[#30B057] lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[length:28px_28px]" />
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 max-w-md px-8 text-white">
            <img
              src={logoSemFundo}
              alt="Logo"
              className="mb-10 h-24 w-auto object-contain"
            />

            <h1 className="text-4xl font-bold leading-tight">
              Comece a cuidar da saúde mental da sua equipe.
            </h1>

            <p className="mt-5 text-base leading-8 text-white/85">
              Cadastre sua empresa, escolha um plano e tenha acesso a uma
              plataforma segura para acompanhamento preventivo.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <img
                src={logoSemFundo}
                alt="Logo"
                className="h-20 w-auto object-contain"
              />
            </div>

            <span className="inline-flex rounded-full bg-[#30B057]/10 px-4 py-2 text-sm font-semibold text-[#30B057]">
              Cadastro empresarial
            </span>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
              Criar conta
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Preencha os dados abaixo para iniciar o cadastro da sua empresa.
            </p>

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nome do responsável
                </label>
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#047CAB] focus:ring-4 focus:ring-[#047CAB]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email corporativo
                </label>
                <input
                  type="email"
                  placeholder="seuemail@empresa.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#047CAB] focus:ring-4 focus:ring-[#047CAB]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nome da empresa
                </label>
                <input
                  type="text"
                  placeholder="Nome da empresa"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#047CAB] focus:ring-4 focus:ring-[#047CAB]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  CNPJ
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#047CAB] focus:ring-4 focus:ring-[#047CAB]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Crie uma senha"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#047CAB] focus:ring-4 focus:ring-[#047CAB]/10"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#30B057] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#26994B]"
              >
                Criar conta
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Já possui conta?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#047CAB] hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}