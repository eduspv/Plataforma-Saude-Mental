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

import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";

import {
  CLASSIFICATION_LABELS,
} from "../../lib/diagnosticClassification";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type TestItem = {
  id: string;
  classification: string;
  recommendation: string;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

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

function CalendarIcon() {
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
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="3"
      />

      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
    </svg>
  );
}

function ClipboardIcon() {
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
      <rect
        x="5"
        y="4"
        width="14"
        height="17"
        rx="2"
      />

      <path d="M9 4.5V3h6v1.5" />
      <path d="M8 10h8" />
      <path d="M8 14h6" />
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

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
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

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getClassificationLabel(
  classification: string
) {
  return (
    CLASSIFICATION_LABELS[
      classification
    ] ?? classification
  );
}

function formatDate(date: string) {
  return new Date(
    date
  ).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatFullDate(date: string) {
  return new Date(
    date
  ).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
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
// MÉTRICA
// ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  helper,
  tone = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  tone?: "blue" | "green";
}) {
  return (
    <div
      className="
        group
        relative

        overflow-hidden

        rounded-[26px]

        border
        border-slate-200/80

        bg-white

        p-6

        shadow-[0_12px_40px_rgba(15,23,42,0.04)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_20px_55px_rgba(15,23,42,0.075)]
      "
    >
      <div
        className={`
          pointer-events-none

          absolute
          -right-14
          -top-14

          h-36
          w-36

          rounded-full

          blur-[55px]

          ${
            tone === "green"
              ? "bg-emerald-300/20"
              : "bg-blue-300/20"
          }
        `}
      />

      <div className="relative z-10">
        <span
          className={`
            flex
            h-10
            w-10

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

        <p
          className="
            mt-7

            text-[10px]
            font-medium
            uppercase

            tracking-[0.16em]

            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-2

            text-2xl
            font-light

            tracking-[-0.04em]

            text-slate-950
          "
        >
          {value}
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
          {helper}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div
      className="
        mt-10
        animate-pulse
      "
    >
      <div
        className="
          grid
          gap-4

          sm:grid-cols-3
        "
      >
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="
                h-[190px]

                rounded-[26px]

                bg-slate-200/60
              "
            />
          )
        )}
      </div>

      <div
        className="
          mt-6
          h-[310px]

          rounded-[32px]

          bg-slate-200/60
        "
      />

      <div
        className="
          mt-6
          space-y-4
        "
      >
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="
                h-[150px]

                rounded-[26px]

                bg-slate-200/60
              "
            />
          )
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HISTÓRICO
// ─────────────────────────────────────────────────────────────

export default function Historico() {
  const [tests, setTests] =
    useState<TestItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    selectedClassification,
    setSelectedClassification,
  ] = useState("all");

  // ───────────────────────────────────────────────────────────
  // CARREGAR
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const response =
          await api.get(
            "/api/v1/diagnostic/history"
          );

        if (!cancelled) {
          setTests(
            response.data.data.tests ??
              []
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Não foi possível carregar o histórico."
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

  // ───────────────────────────────────────────────────────────
  // ORDENAR
  // ───────────────────────────────────────────────────────────

  const sortedTests = useMemo(
    () =>
      [...tests].sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      ),
    [tests]
  );

  const latestTest =
    sortedTests[0] ?? null;

  const firstTest =
    sortedTests.length > 0
      ? sortedTests[
          sortedTests.length - 1
        ]
      : null;

  // ───────────────────────────────────────────────────────────
  // CLASSIFICAÇÕES EXISTENTES
  // ───────────────────────────────────────────────────────────

  const classifications =
    useMemo(() => {
      return Array.from(
        new Set(
          sortedTests.map(
            (test) =>
              test.classification
          )
        )
      );
    }, [sortedTests]);

  // ───────────────────────────────────────────────────────────
  // FILTRO
  // ───────────────────────────────────────────────────────────

  const filteredTests =
    useMemo(() => {
      if (
        selectedClassification ===
        "all"
      ) {
        return sortedTests;
      }

      return sortedTests.filter(
        (test) =>
          test.classification ===
          selectedClassification
      );
    }, [
      sortedTests,
      selectedClassification,
    ]);

  return (
    <div
      className="
        min-h-full

        font-['Manrope',sans-serif]
      "
    >
      <div
        className="
          mx-auto
          max-w-[1300px]
        "
      >
        {/* =================================================== */}
        {/* HEADER                                              */}
        {/* =================================================== */}

        <header
          className="
            flex
            flex-col

            gap-5

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-medium
                uppercase

                tracking-[0.2em]

                text-emerald-700
              "
            >
              Acompanhamento
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
              Meu histórico
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
              Consulte suas avaliações
              anteriores e acesse os
              resultados registrados na
              plataforma.
            </p>
          </div>

          <Link
            to="/colaborador/diagnostico"
            className="
              group

              inline-flex
              h-[48px]

              items-center
              justify-center
              gap-2

              self-start

              rounded-[16px]

              bg-slate-950

              px-5

              text-sm
              font-medium

              text-white

              shadow-[0_10px_28px_rgba(15,23,42,0.12)]

              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:bg-slate-900

              lg:self-auto
            "
          >
            Nova avaliação

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
        </header>

        {/* =================================================== */}
        {/* ERRO                                                */}
        {/* =================================================== */}

        {error && (
          <div className="mt-6">
            <ErrorMessage>
              {error}
            </ErrorMessage>
          </div>
        )}

        {/* =================================================== */}
        {/* LOADING                                             */}
        {/* =================================================== */}

        {loading && (
          <LoadingState />
        )}

        {/* =================================================== */}
        {/* VAZIO                                               */}
        {/* =================================================== */}

        {!loading &&
          !error &&
          tests.length === 0 && (
            <Panel
              className="
                relative
                mt-10

                overflow-hidden

                px-6
                py-20
              "
            >
              <div
                className="
                  pointer-events-none

                  absolute
                  left-1/2
                  top-1/2

                  h-[360px]
                  w-[360px]

                  -translate-x-1/2
                  -translate-y-1/2

                  rounded-full

                  bg-gradient-to-br
                  from-blue-100/60
                  to-emerald-100/60

                  blur-[100px]
                "
              />

              <div
                className="
                  relative
                  z-10

                  mx-auto
                  max-w-lg

                  text-center
                "
              >
                <span
                  className="
                    mx-auto

                    flex
                    h-16
                    w-16

                    items-center
                    justify-center

                    rounded-[22px]

                    border
                    border-slate-200

                    bg-white

                    text-blue-600

                    shadow-[0_12px_35px_rgba(15,23,42,0.06)]
                  "
                >
                  <HistoryIcon />
                </span>

                <div className="mt-6">
                  <EmptyState>
                    Nenhum teste realizado
                    ainda.
                  </EmptyState>
                </div>

                <p
                  className="
                    mx-auto
                    mt-4

                    max-w-md

                    text-sm
                    font-light
                    leading-6

                    text-slate-400
                  "
                >
                  Depois que você concluir sua
                  primeira avaliação, o
                  resultado ficará registrado
                  aqui.
                </p>

                <Link
                  to="/colaborador/diagnostico"
                  className="
                    group

                    mt-7

                    inline-flex
                    h-[48px]

                    items-center
                    justify-center
                    gap-2

                    rounded-[16px]

                    bg-slate-950

                    px-6

                    text-sm
                    font-medium

                    text-white

                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-slate-900
                  "
                >
                  Iniciar avaliação

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
              </div>
            </Panel>
          )}

        {/* =================================================== */}
        {/* CONTEÚDO                                            */}
        {/* =================================================== */}

        {!loading &&
          tests.length > 0 && (
            <>
              {/* ============================================= */}
              {/* MÉTRICAS                                     */}
              {/* ============================================= */}

              <div
                className="
                  mt-10

                  grid
                  gap-4

                  sm:grid-cols-3
                "
              >
                <MetricCard
                  icon={
                    <ClipboardIcon />
                  }
                  label="Avaliações"
                  value={String(
                    tests.length
                  )}
                  helper="Total de avaliações registradas"
                  tone="blue"
                />

                <MetricCard
                  icon={
                    <CalendarIcon />
                  }
                  label="Primeira avaliação"
                  value={
                    firstTest
                      ? formatDate(
                          firstTest.created_at
                        )
                      : "—"
                  }
                  helper="Início do histórico registrado"
                  tone="green"
                />

                <MetricCard
                  icon={
                    <HistoryIcon />
                  }
                  label="Última avaliação"
                  value={
                    latestTest
                      ? formatDate(
                          latestTest.created_at
                        )
                      : "—"
                  }
                  helper="Registro mais recente"
                  tone="blue"
                />
              </div>

              {/* ============================================= */}
              {/* ÚLTIMO RESULTADO                             */}
              {/* ============================================= */}

              {latestTest && (
                <div
                  className="
                    group
                    relative

                    mt-6

                    overflow-hidden

                    rounded-[34px]

                    bg-slate-950

                    p-7

                    text-white

                    shadow-[0_24px_70px_rgba(15,23,42,0.15)]

                    sm:p-9
                  "
                >
                  {/* GLOWS */}

                  <div
                    className="
                      pointer-events-none

                      absolute
                      -right-28
                      -top-28

                      h-[380px]
                      w-[380px]

                      rounded-full

                      bg-blue-500/20

                      blur-[105px]
                    "
                  />

                  <div
                    className="
                      pointer-events-none

                      absolute
                      -bottom-36
                      left-[20%]

                      h-[340px]
                      w-[340px]

                      rounded-full

                      bg-emerald-500/20

                      blur-[105px]
                    "
                  />

                  {/* CÍRCULOS */}

                  <div
                    className="
                      pointer-events-none

                      absolute
                      right-14
                      top-12

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
                      right-[86px]
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
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col

                        gap-6

                        sm:flex-row
                        sm:items-start
                        sm:justify-between
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
                          Resultado mais recente
                        </p>

                        <h2
                          className="
                            mt-4

                            max-w-2xl

                            text-4xl
                            font-light

                            leading-[1.05]
                            tracking-[-0.05em]

                            text-white

                            sm:text-5xl
                          "
                        >
                          {getClassificationLabel(
                            latestTest.classification
                          )}
                        </h2>

                        <p
                          className="
                            mt-3

                            text-xs
                            font-light

                            text-white/40
                          "
                        >
                          {formatFullDate(
                            latestTest.created_at
                          )}
                        </p>
                      </div>

                      <span
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0

                          items-center
                          justify-center

                          rounded-[16px]

                          border
                          border-white/10

                          bg-white/[0.06]

                          text-white/70
                        "
                      >
                        <ClipboardIcon />
                      </span>
                    </div>

                    {/* RECOMENDAÇÃO */}

                    <div
                      className="
                        mt-10

                        max-w-3xl
                      "
                    >
                      <p
                        className="
                          text-[9px]
                          font-medium
                          uppercase

                          tracking-[0.16em]

                          text-white/30
                        "
                      >
                        Recomendação
                      </p>

                      <p
                        className="
                          mt-3

                          line-clamp-3

                          text-sm
                          font-light
                          leading-7

                          text-white/60
                        "
                      >
                        {latestTest.recommendation ||
                          "Nenhuma recomendação disponível."}
                      </p>
                    </div>

                    <div
                      className="
                        mt-9

                        flex
                        flex-col

                        gap-5

                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-light

                          text-white/35
                        "
                      >
                        Consulte o resultado
                        completo para visualizar
                        todos os detalhes.
                      </p>

                      <Link
                        to={`/colaborador/resultado/${latestTest.id}`}
                        state={{
                          classification:
                            latestTest.classification,
                          recommendation:
                            latestTest.recommendation,
                          created_at:
                            latestTest.created_at,
                        }}
                        className="
                          group/button

                          inline-flex
                          h-[48px]

                          shrink-0

                          items-center
                          justify-center
                          gap-2

                          rounded-[16px]

                          bg-white

                          px-5

                          text-sm
                          font-medium

                          text-slate-950

                          transition-all
                          duration-300

                          hover:-translate-y-0.5
                          hover:bg-emerald-50
                        "
                      >
                        Ver resultado

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
              )}

              {/* ============================================= */}
              {/* HISTÓRICO                                    */}
              {/* ============================================= */}

              <Panel
                className="
                  mt-6
                  overflow-hidden
                "
              >
                {/* CABEÇALHO */}

                <div
                  className="
                    border-b
                    border-slate-100

                    p-7

                    sm:p-8
                  "
                >
                  <div
                    className="
                      flex
                      flex-col

                      gap-6

                      lg:flex-row
                      lg:items-end
                      lg:justify-between
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
                        Registros
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
                        Histórico de avaliações
                      </h2>

                      <p
                        className="
                          mt-2

                          text-sm
                          font-light

                          text-slate-400
                        "
                      >
                        Seus resultados estão
                        organizados do mais
                        recente para o mais
                        antigo.
                      </p>
                    </div>

                    {/* FILTRO */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2

                        overflow-x-auto

                        pb-1

                        [&::-webkit-scrollbar]:hidden
                        [-ms-overflow-style:none]
                        [scrollbar-width:none]
                      "
                    >
                      <span
                        className="
                          mr-1

                          flex
                          h-9
                          w-9
                          shrink-0

                          items-center
                          justify-center

                          rounded-[12px]

                          bg-slate-50

                          text-slate-400
                        "
                      >
                        <FilterIcon />
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedClassification(
                            "all"
                          )
                        }
                        className={`
                          h-[38px]
                          shrink-0

                          cursor-pointer

                          rounded-[12px]

                          px-4

                          text-xs
                          font-medium

                          transition-all
                          duration-300

                          ${
                            selectedClassification ===
                            "all"
                              ? `
                                bg-slate-950
                                text-white
                              `
                              : `
                                bg-slate-50
                                text-slate-500

                                hover:bg-slate-100
                                hover:text-slate-800
                              `
                          }
                        `}
                      >
                        Todos
                      </button>

                      {classifications.map(
                        (
                          classification
                        ) => (
                          <button
                            key={
                              classification
                            }
                            type="button"
                            onClick={() =>
                              setSelectedClassification(
                                classification
                              )
                            }
                            className={`
                              h-[38px]
                              shrink-0

                              cursor-pointer

                              rounded-[12px]

                              px-4

                              text-xs
                              font-medium

                              transition-all
                              duration-300

                              ${
                                selectedClassification ===
                                classification
                                  ? `
                                    bg-slate-950
                                    text-white
                                  `
                                  : `
                                    bg-slate-50
                                    text-slate-500

                                    hover:bg-slate-100
                                    hover:text-slate-800
                                  `
                              }
                            `}
                          >
                            {getClassificationLabel(
                              classification
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* =========================================== */}
                {/* LISTA                                      */}
                {/* =========================================== */}

                {filteredTests.length ===
                0 ? (
                  <div
                    className="
                      px-6
                      py-14

                      text-center
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-light

                        text-slate-400
                      "
                    >
                      Nenhuma avaliação
                      encontrada com esse
                      filtro.
                    </p>
                  </div>
                ) : (
                  <div
                    className="
                      p-5

                      sm:p-7
                    "
                  >
                    <div
                      className="
                        relative
                        space-y-3
                      "
                    >
                      {filteredTests.map(
                        (
                          test,
                          index
                        ) => (
                          <HistoryItem
                            key={test.id}
                            test={test}
                            index={index}
                            total={
                              filteredTests.length
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </Panel>

              {/* ============================================= */}
              {/* PRIVACIDADE                                  */}
              {/* ============================================= */}

              <div
                className="
                  relative

                  mt-6

                  overflow-hidden

                  rounded-[28px]

                  border
                  border-emerald-100

                  bg-gradient-to-r
                  from-emerald-50/80
                  via-white
                  to-blue-50/80

                  p-6

                  sm:p-7
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
                    items-start
                    gap-4
                  "
                >
                  <span
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0

                      items-center
                      justify-center

                      rounded-[15px]

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
                      Seus registros
                    </p>

                    <h3
                      className="
                        mt-2

                        text-lg
                        font-light

                        tracking-[-0.025em]

                        text-slate-950
                      "
                    >
                      Histórico pessoal de
                      avaliações
                    </h3>

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
                      Esta área reúne os
                      resultados vinculados à
                      sua conta para que você
                      possa consultar seus
                      registros anteriores.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ITEM DO HISTÓRICO
// ─────────────────────────────────────────────────────────────

function HistoryItem({
  test,
  index,
  total,
}: {
  test: TestItem;
  index: number;
  total: number;
}) {
  return (
    <div
      className="
        relative

        grid
        grid-cols-[34px_1fr]
        gap-4
      "
    >
      {/* TIMELINE */}

      <div
        className="
          relative

          flex
          justify-center
        "
      >
        <span
          className="
            relative
            z-10

            mt-7

            h-3
            w-3

            rounded-full

            border-[3px]
            border-white

            bg-blue-500

            shadow-[0_0_0_1px_rgba(37,99,235,0.18)]
          "
        />

        {index <
          total - 1 && (
          <span
            className="
              absolute
              bottom-[-14px]
              top-[39px]

              w-px

              bg-slate-200
            "
          />
        )}
      </div>

      {/* CARD */}

      <Link
        to={`/colaborador/resultado/${test.id}`}
        state={{
          classification:
            test.classification,
          recommendation:
            test.recommendation,
          created_at:
            test.created_at,
        }}
        className="
          group
          relative

          mb-3

          overflow-hidden

          rounded-[24px]

          border
          border-slate-200/80

          bg-white

          p-5

          transition-all
          duration-300

          hover:-translate-y-0.5
          hover:border-blue-200
          hover:shadow-[0_16px_45px_rgba(15,23,42,0.07)]

          sm:p-6
        "
      >
        <div
          className="
            pointer-events-none

            absolute
            -right-14
            -top-14

            h-32
            w-32

            rounded-full

            bg-blue-200/15

            blur-[45px]

            transition-transform
            duration-500

            group-hover:scale-125
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
            sm:items-center
            sm:justify-between
          "
        >
          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <p
                className="
                  text-base
                  font-medium

                  tracking-[-0.02em]

                  text-slate-900
                "
              >
                {getClassificationLabel(
                  test.classification
                )}
              </p>

              <span
                className="
                  rounded-full

                  bg-emerald-50

                  px-2.5
                  py-1

                  text-[9px]
                  font-medium
                  uppercase

                  tracking-[0.12em]

                  text-emerald-700
                "
              >
                Concluído
              </span>
            </div>

            <p
              className="
                mt-2

                text-xs
                font-light

                text-slate-400
              "
            >
              {formatFullDate(
                test.created_at
              )}
            </p>

            {test.recommendation && (
              <p
                className="
                  mt-4

                  line-clamp-2
                  max-w-3xl

                  text-xs
                  font-light
                  leading-5

                  text-slate-500
                "
              >
                {test.recommendation}
              </p>
            )}
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
            "
          >
            <span
              className="
                text-[11px]
                font-medium

                text-slate-400

                transition-colors

                group-hover:text-blue-600
              "
            >
              Ver resultado
            </span>

            <span
              className="
                flex
                h-9
                w-9

                items-center
                justify-center

                rounded-[12px]

                bg-slate-50

                text-slate-400

                transition-all
                duration-300

                group-hover:translate-x-1
                group-hover:bg-blue-50
                group-hover:text-blue-600
              "
            >
              <ArrowRightIcon />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}