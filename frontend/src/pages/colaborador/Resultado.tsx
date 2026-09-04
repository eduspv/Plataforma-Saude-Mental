import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  type ReactNode,
} from "react";

import {
  CLASSIFICATION_LABELS,
} from "../../lib/diagnosticClassification";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type ResultadoState = {
  classification: string;
  recommendation: string;
  disclaimer?: string;
  created_at?: string;
};

// Mesmo texto fixo do backend.
// Usado quando o resultado vem do histórico
// e o campo disclaimer não é enviado.

const FIXED_DISCLAIMER =
  "Este resultado é uma triagem inicial e não substitui avaliação médica, psicológica ou psiquiátrica profissional.";

const HIGH_RISK_CLASSIFICATIONS = [
  "risco_elevado",
  "risco_critico",
];

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function ResultIcon() {
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

function ArrowLeftIcon() {
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
      <path d="M16 10H4" />
      <path d="m8 6-4 4 4 4" />
    </svg>
  );
}

function CalendarIcon() {
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

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function SparkIcon() {
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
      <path d="M12 3c.8 4.5 3.5 7.2 8 8-4.5.8-7.2 3.5-8 8-.8-4.5-3.5-7.2-8-8 4.5-.8 7.2-3.5 8-8Z" />
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
// DATA
// ─────────────────────────────────────────────────────────────

function formatDate(
  date?: string
) {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed.toLocaleDateString(
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
// RESULTADO INDISPONÍVEL
// ─────────────────────────────────────────────────────────────

function ResultUnavailable() {
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
          max-w-[1000px]
        "
      >
        <Panel
          className="
            relative
            overflow-hidden
            px-6
            py-20
            sm:px-10
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[380px]
              w-[380px]
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
              <ResultIcon />
            </span>

            <p
              className="
                mt-7
                text-[10px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Resultado
            </p>

            <h1
              className="
                mt-3
                text-3xl
                font-light
                tracking-[-0.045em]
                text-slate-950
                sm:text-4xl
              "
            >
              Resultado não disponível
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-md
                text-sm
                font-light
                leading-6
                text-slate-500
              "
            >
              Abra um resultado a partir do
              histórico ou realize uma nova
              avaliação.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                items-center
                justify-center
                gap-3
                sm:flex-row
              "
            >
              <Link
                to="/colaborador/historico"
                className="
                  group
                  inline-flex
                  h-[48px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[16px]
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-medium
                  text-slate-600
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:text-slate-950
                "
              >
                <ArrowLeftIcon />

                Ir para histórico
              </Link>

              <Link
                to="/colaborador/diagnostico"
                className="
                  group
                  inline-flex
                  h-[48px]
                  items-center
                  justify-center
                  gap-2
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
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RESULTADO
// ─────────────────────────────────────────────────────────────

export default function Resultado() {
  const location =
    useLocation();

  const resultado =
    location.state as
      | ResultadoState
      | null;

  if (!resultado) {
    return (
      <ResultUnavailable />
    );
  }

  const classificationLabel =
    CLASSIFICATION_LABELS[
      resultado.classification
    ] ??
    resultado.classification;

  const isHighRisk =
    HIGH_RISK_CLASSIFICATIONS.includes(
      resultado.classification
    );

  const formattedDate =
    formatDate(
      resultado.created_at
    );

  const disclaimer =
    resultado.disclaimer ??
    FIXED_DISCLAIMER;

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
          max-w-[1200px]
        "
      >
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

        <header
          className="
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
                text-[10px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-emerald-700
              "
            >
              Avaliação concluída
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
              Seu resultado
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
              Consulte a classificação e a
              recomendação geradas a partir
              das respostas enviadas.
            </p>
          </div>

          <Link
            to="/colaborador/historico"
            className="
              group
              inline-flex
              h-[46px]
              items-center
              justify-center
              gap-2
              self-start
              rounded-[15px]
              border
              border-slate-200
              bg-white
              px-5
              text-sm
              font-medium
              text-slate-600
              shadow-[0_8px_25px_rgba(15,23,42,0.04)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-slate-300
              hover:text-slate-950

              sm:self-auto
            "
          >
            <ArrowLeftIcon />

            Meu histórico
          </Link>
        </header>

        {/* ================================================= */}
        {/* HERO DO RESULTADO                                */}
        {/* ================================================= */}

        <div
          className={`
            group
            relative

            mt-10

            min-h-[350px]

            overflow-hidden

            rounded-[36px]

            p-7

            text-white

            shadow-[0_26px_75px_rgba(15,23,42,0.16)]

            sm:p-10

            ${
              isHighRisk
                ? "bg-[#181314]"
                : "bg-slate-950"
            }
          `}
        >
          {/* GLOW SUPERIOR */}

          <div
            className={`
              pointer-events-none

              absolute
              -right-28
              -top-28

              h-[420px]
              w-[420px]

              rounded-full

              blur-[110px]

              ${
                isHighRisk
                  ? "bg-red-500/20"
                  : "bg-blue-500/20"
              }
            `}
          />

          {/* GLOW INFERIOR */}

          <div
            className={`
              pointer-events-none

              absolute
              -bottom-36
              left-[18%]

              h-[370px]
              w-[370px]

              rounded-full

              blur-[110px]

              ${
                isHighRisk
                  ? "bg-orange-500/10"
                  : "bg-emerald-500/20"
              }
            `}
          />

          {/* CÍRCULOS */}

          <div
            className="
              pointer-events-none
              absolute
              right-12
              top-10
              h-52
              w-52
              rounded-full
              border
              border-white/[0.055]
            "
          />

          <div
            className={`
              pointer-events-none

              absolute
              right-[84px]
              top-[72px]

              h-36
              w-36

              rounded-full

              border

              ${
                isHighRisk
                  ? "border-red-300/10"
                  : "border-emerald-300/10"
              }
            `}
          />

          <div
            className="
              relative
              z-10

              flex
              min-h-[280px]
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
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-3
                  "
                >
                  <p
                    className={`
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.2em]

                      ${
                        isHighRisk
                          ? "text-red-300"
                          : "text-emerald-300"
                      }
                    `}
                  >
                    Classificação
                  </p>

                  {isHighRisk && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-red-300/15
                        bg-red-400/10
                        px-3
                        py-1.5
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.14em]
                        text-red-200
                        backdrop-blur-xl
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-red-400
                          shadow-[0_0_8px_rgba(248,113,113,0.9)]
                        "
                      />

                      Atenção
                    </span>
                  )}
                </div>

                <h2
                  className="
                    mt-5
                    max-w-3xl
                    text-[clamp(2.6rem,6vw,5.4rem)]
                    font-light
                    leading-[0.98]
                    tracking-[-0.06em]
                    text-white
                  "
                >
                  {classificationLabel}
                </h2>

                {formattedDate && (
                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      gap-2
                      text-xs
                      font-light
                      text-white/40
                    "
                  >
                    <CalendarIcon />

                    {formattedDate}
                  </div>
                )}
              </div>

              <span
                className={`
                  hidden
                  h-14
                  w-14
                  shrink-0

                  items-center
                  justify-center

                  rounded-[18px]

                  border
                  border-white/10

                  bg-white/[0.06]

                  backdrop-blur-xl

                  sm:flex

                  ${
                    isHighRisk
                      ? "text-red-300"
                      : "text-emerald-300"
                  }
                `}
              >
                {isHighRisk ? (
                  <AlertIcon />
                ) : (
                  <ResultIcon />
                )}
              </span>
            </div>

            {/* STATUS */}

            <div
              className="
                mt-12

                flex
                flex-col
                gap-4

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-white/30
                  "
                >
                  Status
                </p>

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full

                      ${
                        isHighRisk
                          ? "bg-red-400"
                          : "bg-emerald-400"
                      }
                    `}
                  />

                  <p
                    className="
                      text-sm
                      font-light
                      text-white/65
                    "
                  >
                    Avaliação concluída
                  </p>
                </div>
              </div>

              <Link
                to="/colaborador/diagnostico"
                className="
                  group/button

                  inline-flex
                  h-[48px]

                  items-center
                  justify-center
                  gap-2

                  self-start

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

                  sm:self-auto
                "
              >
                Nova avaliação

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

          {/* LINHA INFERIOR */}

          <div
            className={`
              absolute
              bottom-0
              left-0

              h-[2px]
              w-full

              origin-left
              scale-x-0

              bg-gradient-to-r

              transition-transform
              duration-700

              group-hover:scale-x-100

              ${
                isHighRisk
                  ? "from-red-500 via-orange-400 to-amber-400"
                  : "from-blue-500 via-blue-400 to-emerald-400"
              }
            `}
          />
        </div>

        {/* ================================================= */}
        {/* CONTEÚDO                                         */}
        {/* ================================================= */}

        <div
          className="
            mt-6

            grid
            gap-6

            xl:grid-cols-[1.35fr_0.65fr]
          "
        >
          {/* =============================================== */}
          {/* RECOMENDAÇÃO                                   */}
          {/* =============================================== */}

          <Panel
            className={`
              relative
              overflow-hidden
              p-7
              sm:p-8

              ${
                isHighRisk
                  ? "border-red-200/80"
                  : ""
              }
            `}
          >
            {/* GLOW */}

            <div
              className={`
                pointer-events-none

                absolute
                -right-20
                -top-20

                h-64
                w-64

                rounded-full

                blur-[85px]

                ${
                  isHighRisk
                    ? "bg-red-200/25"
                    : "bg-blue-200/20"
                }
              `}
            />

            <div className="relative z-10">
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-5
                "
              >
                <div>
                  <p
                    className={`
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.18em]

                      ${
                        isHighRisk
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    `}
                  >
                    Orientação
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
                    Recomendação
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-light
                      text-slate-400
                    "
                  >
                    Orientação associada ao
                    resultado da sua avaliação.
                  </p>
                </div>

                <span
                  className={`
                    flex
                    h-11
                    w-11
                    shrink-0

                    items-center
                    justify-center

                    rounded-[15px]

                    ${
                      isHighRisk
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }
                  `}
                >
                  {isHighRisk ? (
                    <AlertIcon />
                  ) : (
                    <SparkIcon />
                  )}
                </span>
              </div>

              {/* TEXTO */}

              <div
                className={`
                  mt-8

                  rounded-[24px]

                  border

                  p-6

                  sm:p-7

                  ${
                    isHighRisk
                      ? `
                        border-red-100
                        bg-red-50/60
                      `
                      : `
                        border-slate-100
                        bg-slate-50/70
                      `
                  }
                `}
              >
                <p
                  className={`
                    text-[15px]
                    font-light
                    leading-8

                    ${
                      isHighRisk
                        ? "text-red-950"
                        : "text-slate-700"
                    }
                  `}
                >
                  {resultado.recommendation ||
                    "Nenhuma recomendação foi disponibilizada para este resultado."}
                </p>
              </div>

              {isHighRisk && (
                <div
                  className="
                    mt-5

                    flex
                    items-start
                    gap-3

                    rounded-[18px]

                    bg-red-50

                    p-4
                  "
                >
                  <span
                    className="
                      mt-0.5
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-red-600
                    "
                  >
                    <AlertIcon />
                  </span>

                  <p
                    className="
                      text-xs
                      font-light
                      leading-5
                      text-red-800
                    "
                  >
                    Esta classificação recebeu
                    destaque porque exige maior
                    atenção dentro das regras
                    definidas pelo diagnóstico.
                    Considere integralmente a
                    recomendação apresentada
                    acima.
                  </p>
                </div>
              )}
            </div>
          </Panel>

          {/* =============================================== */}
          {/* SOBRE O RESULTADO                              */}
          {/* =============================================== */}

          <Panel className="p-7 sm:p-8">
            <div
              className="
                flex
                items-start
                justify-between
                gap-5
              "
            >
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
                  Resultado
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
                  Sobre esta avaliação
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
                  bg-emerald-50
                  text-emerald-600
                "
              >
                <ResultIcon />
              </span>
            </div>

            <div className="mt-8 space-y-6">
              <ResultInfo
                label="Classificação"
                value={
                  classificationLabel
                }
              />

              <Divider />

              <ResultInfo
                label="Situação"
                value="Concluído"
              />

              {formattedDate && (
                <>
                  <Divider />

                  <ResultInfo
                    label="Realizado em"
                    value={formattedDate}
                  />
                </>
              )}
            </div>

            <Link
              to="/colaborador/historico"
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
              Consultar histórico

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

        {/* ================================================= */}
        {/* DISCLAIMER                                       */}
        {/* ================================================= */}

        <div
          className="
            relative

            mt-6

            overflow-hidden

            rounded-[30px]

            border
            border-amber-100

            bg-gradient-to-r
            from-amber-50/80
            via-white
            to-orange-50/70

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

              h-64
              w-64

              rounded-full

              bg-amber-200/20

              blur-[85px]
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

                text-amber-600

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
                  text-amber-700
                "
              >
                Informação importante
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
                Sobre esta triagem
              </h2>

              <p
                className="
                  mt-3
                  max-w-4xl
                  text-sm
                  font-light
                  leading-7
                  text-slate-600
                "
              >
                {disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* AÇÕES FINAIS                                     */}
        {/* ================================================= */}

        <div
          className="
            mt-6

            flex
            flex-col
            gap-4

            rounded-[28px]

            border
            border-slate-200/80

            bg-white

            p-6

            shadow-[0_12px_40px_rgba(15,23,42,0.04)]

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-medium
                text-slate-800
              "
            >
              Resultado salvo no histórico
            </p>

            <p
              className="
                mt-1
                text-xs
                font-light
                text-slate-400
              "
            >
              Você pode consultar suas
              avaliações anteriores sempre
              que precisar.
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              gap-3

              sm:flex-row
            "
          >
            <Link
              to="/colaborador/historico"
              className="
                inline-flex
                h-[46px]
                items-center
                justify-center
                gap-2
                rounded-[15px]
                border
                border-slate-200
                bg-white
                px-5
                text-sm
                font-medium
                text-slate-600
                transition-all
                duration-300
                hover:border-slate-300
                hover:text-slate-950
              "
            >
              <ArrowLeftIcon />

              Ver histórico
            </Link>

            <Link
              to="/colaborador/diagnostico"
              className="
                group
                inline-flex
                h-[46px]
                items-center
                justify-center
                gap-2
                rounded-[15px]
                bg-slate-950
                px-5
                text-sm
                font-medium
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-slate-900
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
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INFO
// ─────────────────────────────────────────────────────────────

function ResultInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="
          text-[9px]
          font-medium
          uppercase
          tracking-[0.15em]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-sm
          font-light
          leading-6
          text-slate-800
        "
      >
        {value}
      </p>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="
        h-px
        w-full
        bg-slate-100
      "
    />
  );
}