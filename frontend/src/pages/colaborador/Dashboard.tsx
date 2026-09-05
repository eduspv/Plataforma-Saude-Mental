import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
} from "react-router-dom";

import { api } from "../../lib/api";
import { CLASSIFICATION_LABELS } from "../../lib/diagnosticClassification";
import ErrorMessage from "../../components/ui/ErrorMessage";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type TestItem = {
  id: string;
  classification: string;
  recommendation: string;
  created_at: string;
};

function formatDiagnosticDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function DiagnosticIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="17"
        rx="2"
      />

      <path d="M9 4.5V3h6v1.5" />
      <path d="M8 10h8" />
      <path d="M8 14h4" />
      <path d="m14 15 1.5 1.5L18 14" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5 5 6v5.2c0 4.7 2.9 8.3 7 9.8 4.1-1.5 7-5.1 7-9.8V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10h12" />
      <path d="m12 6 4 4-4 4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 5.8a5.3 5.3 0 0 0-7.5 0L12 7.1l-1.3-1.3a5.3 5.3 0 1 0-7.5 7.5L12 22l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL
// ─────────────────────────────────────────────────────────────

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        rounded-[30px]
        border
        border-slate-200/80
        bg-white
        shadow-[0_15px_50px_rgba(15,23,42,0.045)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUICK ACTION
// ─────────────────────────────────────────────────────────────

function QuickAction({
  to,
  icon,
  title,
  description,
  tone = "blue",
}: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  tone?: "blue" | "green";
}) {
  return (
    <Link
      to={to}
      className="
        group
        relative

        overflow-hidden

        rounded-[24px]

        border
        border-slate-200/80

        bg-white

        p-5

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_18px_50px_rgba(15,23,42,0.07)]
      "
    >
      <div
        className={`
          pointer-events-none

          absolute
          -right-12
          -top-12

          h-28
          w-28

          rounded-full

          blur-[45px]

          ${
            tone === "green"
              ? "bg-emerald-200/25"
              : "bg-blue-200/25"
          }
        `}
      />

      <div className="relative z-10">
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <span
            className={`
              flex
              h-10
              w-10
              shrink-0

              items-center
              justify-center

              rounded-[14px]

              ${
                tone === "green"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >
            {icon}
          </span>

          <span
            className="
              mt-2

              text-slate-300

              transition-all
              duration-300

              group-hover:translate-x-1
              group-hover:text-blue-600
            "
          >
            <ArrowRightIcon />
          </span>
        </div>

        <p
          className="
            mt-6

            text-sm
            font-medium

            text-slate-900
          "
        >
          {title}
        </p>

        <p
          className="
            mt-2

            text-xs
            font-light
            leading-5

            text-slate-400
          "
        >
          {description}
        </p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [tests, setTests] =
    useState<TestItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/api/v1/diagnostic/history"
        );

        const loadedTests: TestItem[] =
          response.data.data.tests ?? [];

        if (!cancelled) {
          setTests(loadedTests);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Não foi possível carregar seu histórico de diagnósticos. Tente novamente em instantes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedTests = useMemo(
    () =>
      [...tests].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      ),
    [tests]
  );

  const latestDiagnostic =
    sortedTests[0] ?? null;

  const hasDiagnostic =
    latestDiagnostic !== null;

  const latestClassification =
    latestDiagnostic
      ? CLASSIFICATION_LABELS[
          latestDiagnostic.classification
        ] ?? latestDiagnostic.classification
      : "";

  const latestDate =
    latestDiagnostic
      ? formatDiagnosticDate(
          latestDiagnostic.created_at
        )
      : "—";

  return (
    <div
      className="
        min-h-full
        font-['Manrope',sans-serif]
      "
    >
      <div className="mx-auto max-w-[1500px]">
        {/* =================================================== */}
        {/* CABEÇALHO                                           */}
        {/* =================================================== */}

        <header>
          <p
            className="
              text-[10px]
              font-medium
              uppercase

              tracking-[0.2em]

              text-emerald-700
            "
          >
            Seu espaço
          </p>

          <h1
            className="
              mt-3

              text-4xl
              font-light

              tracking-[-0.05em]

              text-slate-950

              sm:text-5xl
            "
          >
            Olá!
          </h1>

          <p
            className="
              mt-3

              max-w-2xl

              text-sm
              font-light
              leading-7

              text-slate-500
            "
          >
            Acompanhe suas avaliações e acesse
            rapidamente os recursos disponíveis
            para você.
          </p>
        </header>

        {error && (
          <div className="mt-6">
            <ErrorMessage>
              {error}
            </ErrorMessage>
          </div>
        )}

        {loading && !error && (
          <Panel className="mt-10 p-7 sm:p-8">
            <p className="text-sm font-light text-slate-500">
              Carregando suas avaliações...
            </p>
          </Panel>
        )}

        {/* =================================================== */}
        {/* HERO / STATUS                                       */}
        {/* =================================================== */}

        {!loading && !error && (
        <div
          className="
            mt-10

            grid
            gap-6

            xl:grid-cols-[1.35fr_0.65fr]
          "
        >
          {/* ================================================= */}
          {/* DIAGNÓSTICO                                      */}
          {/* ================================================= */}

          <div
            className="
              group
              relative

              min-h-[360px]

              overflow-hidden

              rounded-[34px]

              bg-slate-950

              p-7

              text-white

              shadow-[0_25px_70px_rgba(15,23,42,0.15)]

              sm:p-9
            "
          >
            {/* GLOW AZUL */}

            <div
              className="
                pointer-events-none

                absolute
                -right-28
                -top-28

                h-[390px]
                w-[390px]

                rounded-full

                bg-blue-500/20

                blur-[110px]
              "
            />

            {/* GLOW VERDE */}

            <div
              className="
                pointer-events-none

                absolute
                -bottom-36
                left-[20%]

                h-[360px]
                w-[360px]

                rounded-full

                bg-emerald-500/20

                blur-[110px]
              "
            />

            {/* CÍRCULOS DECORATIVOS */}

            <div
              className="
                pointer-events-none

                absolute
                right-14
                top-11

                h-48
                w-48

                rounded-full

                border
                border-white/[0.055]
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                right-[88px]
                top-[78px]

                h-32
                w-32

                rounded-full

                border
                border-emerald-300/10
              "
            />

            <div
              className="
                relative
                z-10

                flex
                h-full
                min-h-[290px]

                flex-col
                justify-between
              "
            >
              {/* TOPO */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-6
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.2em]

                      text-emerald-300
                    "
                  >
                    Diagnóstico
                  </p>

                  <h2
                    className="
                      mt-4

                      max-w-2xl

                      text-4xl
                      font-light

                      leading-[1.02]
                      tracking-[-0.055em]

                      text-white

                      sm:text-5xl
                    "
                  >
                    {hasDiagnostic
                      ? "Seu diagnóstico está disponível."
                      : "Comece sua primeira avaliação."}
                  </h2>

                  <p
                    className="
                      mt-5

                      max-w-xl

                      text-sm
                      font-light
                      leading-6

                      text-white/50
                    "
                  >
                    {hasDiagnostic
                      ? latestDiagnostic.recommendation ||
                        "Consulte o resultado da sua avaliação e acompanhe seu histórico na plataforma."
                      : "Você ainda não realizou nenhum diagnóstico. A avaliação ajuda a registrar informações importantes sobre seu momento atual e leva apenas alguns minutos."}
                  </p>
                </div>

                <span
                  className="
                    hidden
                    h-14
                    w-14
                    shrink-0

                    items-center
                    justify-center

                    rounded-[18px]

                    border
                    border-white/10

                    bg-white/[0.07]

                    text-white/80

                    backdrop-blur-xl

                    sm:flex
                  "
                >
                  <DiagnosticIcon />
                </span>
              </div>

              {/* RODAPÉ */}

              <div
                className="
                  mt-12

                  flex
                  flex-col

                  gap-5

                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      font-medium
                      uppercase

                      tracking-[0.17em]

                      text-white/30
                    "
                  >
                    Último diagnóstico
                  </p>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light

                      text-white/65
                    "
                  >
                    {hasDiagnostic
                      ? `${latestClassification} • ${latestDate}`
                      : "Nenhum diagnóstico realizado ainda"}
                  </p>
                </div>

                <Link
                  to="/colaborador/diagnostico"
                  className="
                    group/button

                    inline-flex
                    h-[52px]

                    shrink-0

                    items-center
                    justify-center
                    gap-2.5

                    rounded-[17px]

                    bg-white

                    px-6

                    text-sm
                    font-medium

                    text-slate-950

                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-emerald-50
                  "
                >
                  {hasDiagnostic
                    ? "Realizar nova avaliação"
                    : "Iniciar avaliação"}

                  <span
                    className="
                      transition-transform
                      duration-300

                      group-hover/button:translate-x-1
                    "
                  >
                    <ArrowRightIcon />
                  </span>
                </Link>
              </div>
            </div>

            {/* LINHA */}

            <div
              className="
                absolute
                bottom-0
                left-0

                h-[2px]
                w-full

                origin-left
                scale-x-0

                bg-gradient-to-r
                from-blue-500
                via-blue-400
                to-emerald-400

                transition-transform
                duration-700

                group-hover:scale-x-100
              "
            />
          </div>

          {/* ================================================= */}
          {/* STATUS                                           */}
          {/* ================================================= */}

          <Panel className="p-7 sm:p-8">
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase

                    tracking-[0.18em]

                    text-blue-600
                  "
                >
                  Status
                </p>

                <h2
                  className="
                    mt-2

                    text-2xl
                    font-light

                    tracking-[-0.035em]

                    text-slate-950
                  "
                >
                  Seu acompanhamento
                </h2>
              </div>

              <span
                className="
                  flex
                  h-11
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  rounded-[15px]

                  bg-blue-50

                  text-blue-600
                "
              >
                <HeartIcon />
              </span>
            </div>

            <div className="mt-9">
              <div
                className="
                  rounded-[22px]

                  bg-slate-50/80

                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className={`
                      h-2
                      w-2

                      rounded-full

                      ${
                        hasDiagnostic
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                      }
                    `}
                  />

                  <p
                    className="
                      text-sm
                      font-medium

                      text-slate-800
                    "
                  >
                    {hasDiagnostic
                      ? "Avaliação realizada"
                      : "Avaliação pendente"}
                  </p>
                </div>

                <p
                  className="
                    mt-3

                    text-xs
                    font-light
                    leading-5

                    text-slate-400
                  "
                >
                  {hasDiagnostic
                    ? `Seu diagnóstico mais recente foi classificado como ${latestClassification}.`
                    : "Você ainda não realizou nenhum diagnóstico."}
                </p>
              </div>

              <div
                className="
                  mt-6

                  space-y-5
                "
              >
                <StatusItem
                  label="Avaliações realizadas"
                  value={String(tests.length)}
                />

                <div className="h-px bg-slate-100" />

                <StatusItem
                  label="Última avaliação"
                  value={latestDate}
                />

                <div className="h-px bg-slate-100" />

                <StatusItem
                  label="Próximo passo"
                  value={
                    hasDiagnostic
                      ? "Acompanhar histórico"
                      : "Realizar avaliação"
                  }
                />
              </div>
            </div>
          </Panel>
        </div>
        )}

        {/* =================================================== */}
        {/* ACESSOS RÁPIDOS                                     */}
        {/* =================================================== */}

        <div
          className="
            mt-6

            grid
            gap-4

            md:grid-cols-3
          "
        >
          <QuickAction
            to="/colaborador/diagnostico"
            icon={<DiagnosticIcon />}
            title="Realizar diagnóstico"
            description="Inicie uma nova avaliação de forma rápida e segura."
            tone="blue"
          />

          <QuickAction
            to="/colaborador/historico"
            icon={<HistoryIcon />}
            title="Meu histórico"
            description="Consulte avaliações anteriormente registradas."
            tone="green"
          />

          <QuickAction
            to="/colaborador/perfil"
            icon={<UserIcon />}
            title="Meu perfil"
            description="Atualize seus dados pessoais e informações de acesso."
            tone="blue"
          />
        </div>

        {/* =================================================== */}
        {/* COMO FUNCIONA                                       */}
        {/* =================================================== */}

        <div
          className="
            mt-6

            grid
            gap-6

            xl:grid-cols-[1.2fr_0.8fr]
          "
        >
          <Panel className="p-7 sm:p-8">
            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase

                  tracking-[0.18em]

                  text-emerald-600
                "
              >
                Avaliação
              </p>

              <h2
                className="
                  mt-2

                  text-2xl
                  font-light

                  tracking-[-0.035em]

                  text-slate-950
                "
              >
                Como funciona
              </h2>

              <p
                className="
                  mt-2

                  max-w-xl

                  text-sm
                  font-light
                  leading-6

                  text-slate-400
                "
              >
                O processo foi pensado para ser
                simples e permitir que você
                responda com tranquilidade.
              </p>
            </div>

            <div
              className="
                mt-9

                grid
                gap-4

                sm:grid-cols-3
              "
            >
              <StepCard
                number="01"
                title="Responda"
                description="Preencha as perguntas apresentadas na avaliação."
              />

              <StepCard
                number="02"
                title="Finalize"
                description="Revise suas respostas e conclua o diagnóstico."
              />

              <StepCard
                number="03"
                title="Acompanhe"
                description="Consulte posteriormente os registros disponíveis no histórico."
              />
            </div>
          </Panel>

          {/* ================================================= */}
          {/* TEMPO                                            */}
          {/* ================================================= */}

          <Panel className="p-7 sm:p-8">
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase

                    tracking-[0.18em]

                    text-blue-600
                  "
                >
                  Sua jornada
                </p>

                <h2
                  className="
                    mt-2

                    text-2xl
                    font-light

                    tracking-[-0.035em]

                    text-slate-950
                  "
                >
                  Faça no seu tempo
                </h2>
              </div>

              <span
                className="
                  flex
                  h-11
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  rounded-[15px]

                  bg-blue-50

                  text-blue-600
                "
              >
                <ClockIcon />
              </span>
            </div>

            <p
              className="
                mt-5

                text-sm
                font-light
                leading-6

                text-slate-500
              "
            >
              Reserve alguns minutos em um ambiente
              confortável para responder às
              perguntas com atenção.
            </p>

            <Link
              to="/colaborador/diagnostico"
              className="
                group

                mt-8

                inline-flex
                items-center
                gap-2

                text-sm
                font-medium

                text-blue-700

                transition-colors

                hover:text-blue-900
              "
            >
              Ir para diagnóstico

              <span
                className="
                  transition-transform
                  duration-300

                  group-hover:translate-x-1
                "
              >
                <ArrowRightIcon />
              </span>
            </Link>
          </Panel>
        </div>

        {/* =================================================== */}
        {/* PRIVACIDADE                                         */}
        {/* =================================================== */}

        <div
          className="
            relative

            mt-6

            overflow-hidden

            rounded-[30px]

            border
            border-emerald-100

            bg-gradient-to-r
            from-emerald-50/80
            via-white
            to-blue-50/80

            p-7

            sm:p-8
          "
        >
          <div
            className="
              pointer-events-none

              absolute
              -right-20
              -top-20

              h-60
              w-60

              rounded-full

              bg-blue-200/20

              blur-[80px]
            "
          />

          <div
            className="
              relative
              z-10

              flex
              flex-col

              gap-5

              sm:flex-row
              sm:items-start
            "
          >
            <span
              className="
                flex
                h-12
                w-12
                shrink-0

                items-center
                justify-center

                rounded-[16px]

                bg-white

                text-emerald-600

                shadow-[0_8px_25px_rgba(15,23,42,0.05)]
              "
            >
              <ShieldIcon />
            </span>

            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase

                  tracking-[0.18em]

                  text-emerald-700
                "
              >
                Privacidade
              </p>

              <h2
                className="
                  mt-2

                  text-xl
                  font-light

                  tracking-[-0.025em]

                  text-slate-950
                "
              >
                Suas informações merecem cuidado
              </h2>

              <p
                className="
                  mt-2

                  max-w-3xl

                  text-sm
                  font-light
                  leading-6

                  text-slate-500
                "
              >
                A plataforma deve tratar os dados
                conforme as regras de privacidade e
                acesso definidas para o serviço,
                preservando o caráter pessoal das
                informações do colaborador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-5
      "
    >
      <p
        className="
          text-xs
          font-light

          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          text-xs
          font-medium

          text-slate-800
        "
      >
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ETAPAS
// ─────────────────────────────────────────────────────────────

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-[22px]

        border
        border-slate-100

        bg-slate-50/60

        p-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <span
          className="
            text-[10px]
            font-medium

            tracking-[0.16em]

            text-blue-600
          "
        >
          {number}
        </span>

        <span
          className="
            flex
            h-6
            w-6

            items-center
            justify-center

            rounded-full

            bg-emerald-50

            text-emerald-600
          "
        >
          <CheckIcon />
        </span>
      </div>

      <p
        className="
          mt-6

          text-sm
          font-medium

          text-slate-900
        "
      >
        {title}
      </p>

      <p
        className="
          mt-2

          text-xs
          font-light
          leading-5

          text-slate-400
        "
      >
        {description}
      </p>
    </div>
  );
}