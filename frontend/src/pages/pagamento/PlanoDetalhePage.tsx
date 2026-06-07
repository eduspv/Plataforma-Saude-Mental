import { Link, useParams } from "react-router-dom";

type Plano = {
  titulo: string;
  pessoas: string;
  texto: string;
  badge: string;
  recursos: string[];
  observacao?: string;
};

const recursosEssencial = [
  "Gestão de colaboradores com privacidade preservada",
  "Cadastro e controle de colaboradores",
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

const dadosPlanos: Record<string, Plano> = {
  "5-pessoas": {
    titulo: "Plano Essencial",
    pessoas: "5 pessoas",
    badge: "Para pequenas equipes",
    texto:
      "Plano ideal para pequenas empresas ou equipes que desejam iniciar o acompanhamento preventivo em saúde mental com segurança, organização e privacidade.",
    recursos: recursosEssencial,
  },
  "10-pessoas": {
    titulo: "Plano Profissional",
    pessoas: "10 pessoas",
    badge: "Mais escolhido",
    texto:
      "Plano indicado para empresas em crescimento que precisam acompanhar mais colaboradores com organização, segurança e maior capacidade de gestão.",
    recursos: [
      "Tudo que vem no Plano Essencial",
      "Até 10 colaboradores cadastrados",
      "Maior capacidade de acompanhamento da equipe",
      "Indicado para empresas em fase de crescimento",
      "Mais volume para análise de indicadores empresariais",
    ],
  },
  "20-pessoas": {
    titulo: "Plano Corporativo",
    pessoas: "20 pessoas",
    badge: "Para equipes maiores",
    texto:
      "Plano pensado para empresas com maior volume de colaboradores e necessidade de gestão mais ampla dos indicadores de saúde mental.",
    recursos: [
      "Tudo que vem no Plano Profissional",
      "Até 20 colaboradores cadastrados",
      "Gestão ampliada de colaboradores",
      "Maior base para relatórios e indicadores gerais",
      "Acompanhamento preventivo para equipes mais estruturadas",
    ],
  },
  empresarial: {
    titulo: "Plano Empresarial",
    pessoas: "20+ pessoas",
    badge: "Sob medida",
    texto:
      "Plano personalizado para empresas maiores que precisam de limite ampliado, condições comerciais específicas e atendimento com vendedor da empresa.",
    recursos: [
      "Tudo que vem no Plano Corporativo",
      "Limite personalizado de colaboradores",
      "Condições comerciais sob medida",
      "Atendimento com vendedor da empresa",
      "Possibilidade de negociação conforme porte da operação",
    ],
    observacao:
      "Este plano é indicado para empresas que precisam de uma solução personalizada, com avaliação comercial conforme o número de colaboradores e as necessidades internas.",
  },
};

export default function PlanoDetalhePage() {
  const { tipo } = useParams();
  const plano = dadosPlanos[tipo || ""];

  if (!plano) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-[#047CAB]/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-bold text-slate-900">
            Plano não encontrado
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            O plano que você tentou acessar não está disponível.
          </p>

          <Link
            to="/planos"
            className="mt-6 inline-flex rounded-full bg-[#047CAB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#036B94]"
          >
            Voltar para planos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-800">
      {/* Fundo decorativo */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-96 w-96 rounded-full bg-[#047CAB]/10 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-[#30B057]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,124,171,0.04)_1px,transparent_1px)] bg-[length:34px_34px]" />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">

        {/* Conteúdo principal */}
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Card de apresentação */}
          <section className="relative overflow-hidden rounded-[2rem] border border-[#047CAB]/10 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-10">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#047CAB]/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-[#30B057]/10 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex rounded-full border border-[#30B057]/20 bg-[#30B057]/10 px-4 py-2 text-sm font-semibold text-[#30B057]">
                {plano.badge}
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
                {plano.titulo}
              </h1>

              <div className="mt-6 rounded-3xl bg-[#F8FCFC] p-6">
                <p className="text-sm font-medium text-slate-500">
                  Capacidade do plano
                </p>

                <p className="mt-1 text-4xl font-bold text-[#047CAB]">
                  {plano.pessoas}
                </p>
              </div>

              <p className="mt-6 text-base leading-8 text-slate-600">
                {plano.texto}
              </p>

              {plano.observacao && (
                <div className="mt-6 rounded-2xl border border-[#047CAB]/10 bg-[#047CAB]/5 p-5">
                  <p className="text-sm leading-7 text-slate-600">
                    {plano.observacao}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {tipo === "empresarial" ? (
                  <Link
                    to="/contato"
                    className="rounded-2xl bg-[#047CAB] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#036B94]"
                  >
                    Falar com vendedor
                  </Link>
                ) : (
                  <Link
                    to="/pagamento"
                    className="rounded-2xl bg-[#30B057] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#26994B]"
                  >
                    Contratar plano
                  </Link>
                )}

                <Link
                  to="/planos"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Comparar planos
                </Link>
              </div>
            </div>
          </section>

          {/* O que vem no plano */}
          <section className="relative overflow-hidden rounded-[2rem] border border-[#30B057]/30 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(48,176,87,0.08)_1px,transparent_1px)] bg-[length:22px_22px]" />
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#30B057]/10 blur-3xl" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-[#047CAB]/10 px-4 py-2 text-sm font-semibold text-[#047CAB]">
                Recursos inclusos
              </span>

              <h2 className="mt-5 text-3xl font-bold text-slate-950">
                O que vem no plano
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Veja os principais recursos incluídos neste pacote.
              </p>

              <ul className="mt-8 grid gap-4">
                {plano.recursos.map((recurso) => (
                  <li
                    key={recurso}
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#30B057]/10 text-sm font-bold text-[#30B057]">
                      ✓
                    </span>

                    <span className="text-sm leading-7 text-slate-700">
                      {recurso}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-[#047CAB]/10 bg-[#F8FCFC] p-5">
                <p className="text-sm leading-7 text-slate-600">
                  A plataforma oferece uma triagem inicial e apoio gerencial. O
                  resultado não substitui avaliação médica, psicológica ou
                  psiquiátrica profissional.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}