import { Link } from "react-router-dom";

const recursosEssencial = [
  "Gestão de colaboradores com privacidade preservada",
  "Triagem inicial de saúde mental",
  "Classificação geral do colaborador",
  "Indicação de psicólogo quando necessário",
  "Recomendação de avaliação psiquiátrica em casos de maior risco",
  "Histórico de testes dos colaboradores",
  "Painel empresarial com indicadores gerais",
  "Relatórios gerenciais sem exposição de respostas sensíveis",
  "Controle automático do limite de usuários do plano",
  "Aviso de que a análise não substitui avaliação profissional",
];

const planos = [
  {
    nome: "Plano Essencial",
    pessoas: "5 pessoas",
    descricao:
      "Ideal para pequenas equipes que querem iniciar o acompanhamento preventivo da saúde mental no ambiente corporativo.",
    rota: "/plano/5-pessoas",
    recursos: recursosEssencial,
  },
  {
    nome: "Plano Profissional",
    pessoas: "10 pessoas",
    descricao:
      "Indicado para empresas em crescimento que precisam acompanhar mais colaboradores com segurança e organização.",
    rota: "/plano/10-pessoas",
    destaque: true,
    recursos: [
      "Tudo que vem no Plano Essencial",
      "Até 10 colaboradores cadastrados",
      "Maior capacidade de acompanhamento da equipe",
      "Indicado para empresas em fase de crescimento",
    ],
  },
  {
    nome: "Plano Corporativo",
    pessoas: "20 pessoas",
    descricao:
      "Para empresas com equipes maiores e necessidade de gestão mais ampla dos indicadores de saúde mental.",
    rota: "/plano/20-pessoas",
    recursos: [
      "Tudo que vem no Plano Profissional",
      "Até 20 colaboradores cadastrados",
      "Gestão ampliada de colaboradores",
      "Mais volume para relatórios e indicadores empresariais",
    ],
  },
  {
    nome: "Plano Empresarial",
    pessoas: "20+ pessoas",
    descricao:
      "Solução personalizada para empresas que precisam de atendimento comercial e condições sob medida.",
    rota: "/plano/empresarial",
    recursos: [
      "Tudo que vem no Plano Corporativo",
      "Limite personalizado de colaboradores",
      "Condições comerciais sob medida",
      "Atendimento com vendedor da empresa",
    ],
  },
];

export default function PlanosPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-800">
      {/* Fundo decorativo */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-96 w-96 rounded-full bg-[#047CAB]/10 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-[#30B057]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,124,171,0.04)_1px,transparent_1px)] bg-[length:34px_34px]" />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        {/* Header */}
        <header className="mb-14">
          <div className="grid items-end gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex rounded-full border border-[#30B057]/20 bg-[#30B057]/10 px-4 py-2 text-sm font-semibold text-[#30B057]">
                Planos para empresas
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
                Conheça nossos planos
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Escolha a melhor estrutura para acompanhar indicadores,
                organizar colaboradores e apoiar a prevenção em saúde mental
                dentro da sua empresa.
              </p>
            </div>

            <div className="rounded-3xl border border-[#047CAB]/10 bg-[#F8FCFC] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#047CAB]">
                Cuidado preventivo
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                A empresa acompanha apenas informações gerenciais e
                classificações gerais. As respostas sensíveis dos colaboradores
                permanecem protegidas.
              </p>
            </div>
          </div>
        </header>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {planos.map((plano) => (
            <article
              key={plano.nome}
              className={`group relative overflow-hidden rounded-[2rem] border border-[#30B057]/30 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:border-[#30B057] hover:shadow-[0_30px_80px_rgba(4,124,171,0.14)] ${
                plano.destaque ? "ring-2 ring-[#30B057]/25" : ""
              }`}
            >
              {/* Linhas verdes finas no hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(48,176,87,0.12)_1px,transparent_1px)] bg-[length:18px_18px]" />
              </div>

              {/* Luz decorativa */}
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#047CAB]/10 blur-3xl transition duration-300 group-hover:bg-[#30B057]/20" />

              <div className="relative z-10 flex min-h-full flex-col">
                <div className="mb-5">
                  {plano.destaque ? (
                    <span className="inline-flex rounded-full bg-[#047CAB] px-3 py-1 text-xs font-semibold text-white">
                      Mais escolhido
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-[#047CAB]/10 px-3 py-1 text-xs font-semibold text-[#047CAB]">
                      Plano disponível
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-950">
                  {plano.nome}
                </h2>

                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-500">
                    Capacidade
                  </p>

                  <p className="mt-1 text-3xl font-bold text-[#047CAB]">
                    {plano.pessoas}
                  </p>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {plano.descricao}
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="mb-4 text-sm font-semibold text-slate-900">
                    O que vem incluso:
                  </p>

                  <ul className="space-y-3">
                    {plano.recursos.map((recurso) => (
                      <li
                        key={recurso}
                        className="flex gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#30B057]/10 text-xs font-bold text-[#30B057]">
                          ✓
                        </span>
                        <span>{recurso}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    to={plano.rota}
                    className={`flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      plano.destaque
                        ? "bg-[#30B057] text-white hover:bg-[#26994B]"
                        : "bg-[#047CAB] text-white hover:bg-[#036B94]"
                    }`}
                  >
                    {plano.nome === "Plano Empresarial"
                      ? "Falar com vendedor"
                      : "Ver plano"}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Observação */}
        <div className="mt-12 rounded-[2rem] border border-[#047CAB]/10 bg-[#F8FCFC] p-6 text-center shadow-sm">
          <p className="mx-auto max-w-4xl text-sm leading-7 text-slate-600">
            A plataforma realiza uma triagem inicial de apoio e organização. Os
            resultados não substituem avaliação médica, psicológica ou
            psiquiátrica profissional. Em situações de maior atenção, o sistema
            recomenda encaminhamento para profissional habilitado.
          </p>

          <Link
            to="/plano/empresarial"
            className="mt-5 inline-flex rounded-full bg-[#30B057] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#26994B]"
          >
            Preciso de mais de 20 colaboradores
          </Link>
        </div>
      </section>
    </main>
  );
}