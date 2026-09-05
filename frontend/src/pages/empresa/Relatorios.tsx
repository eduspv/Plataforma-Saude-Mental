import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../../lib/api";

import ErrorMessage from "../../components/ui/ErrorMessage";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type CompanyReportData = {
  total_employees: number;
  total_tests: number;
  employees_tested: number;
  at_risk_count: number;
};

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5a3 3 0 0 1 0 6" />
      <path d="M21 20c0-2.6-1.6-4.8-4-5.6" />
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
      <path d="M8 14h8" />
    </svg>
  );
}

function RiskIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V10" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M3 19h18" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 20h14" />
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
    >
      <path d="M12 3.5 5 6v5.2c0 4.7 2.9 8.3 7 9.8 4.1-1.5 7-5.1 7-9.8V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
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
// MÉTRICA
// ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber";
}) {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      glow: "bg-blue-300/20",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-600",
      glow: "bg-emerald-300/20",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
      glow: "bg-amber-300/20",
    },
  };

  const style = tones[tone];

  return (
    <div
      className="
        group
        relative

        overflow-hidden

        rounded-[28px]

        border
        border-slate-200/80

        bg-white

        p-6

        shadow-[0_15px_50px_rgba(15,23,42,0.045)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_24px_65px_rgba(15,23,42,0.08)]
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

          ${style.glow}
        `}
      />

      <div className="relative z-10">
        <div
          className={`
            flex
            h-10
            w-10

            items-center
            justify-center

            rounded-[14px]

            ${style.icon}
          `}
        >
          {icon}
        </div>

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

            text-3xl
            font-light

            tracking-[-0.05em]

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
// TOOLTIP
// ─────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
}: any) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const item = payload[0];

  return (
    <div
      className="
        rounded-[14px]

        border
        border-slate-200

        bg-white

        px-4
        py-3

        shadow-[0_15px_40px_rgba(15,23,42,0.10)]
      "
    >
      <p className="text-xs font-medium text-slate-700">
        {item.name}
      </p>

      <p className="mt-1 text-sm font-light text-slate-500">
        {item.value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="mt-10 animate-pulse">
      <div
        className="
          grid
          gap-4

          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-[205px]

              rounded-[28px]

              bg-slate-200/60
            "
          />
        ))}
      </div>

      <div
        className="
          mt-6

          grid
          gap-6

          xl:grid-cols-2
        "
      >
        <div className="h-[430px] rounded-[30px] bg-slate-200/60" />

        <div className="h-[430px] rounded-[30px] bg-slate-200/60" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RELATÓRIOS
// ─────────────────────────────────────────────────────────────

export default function Relatorios() {
  const [data, setData] =
    useState<CompanyReportData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ───────────────────────────────────────────────────────────
  // CARREGAMENTO
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const response =
          await api.get(
            "/api/v1/dashboard/company"
          );

        if (!cancelled) {
          setData(
            response.data.data
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Não foi possível carregar os dados dos relatórios."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // DADOS DERIVADOS
  // ───────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    if (!data) {
      return null;
    }

    const totalEmployees = Math.max(
      data.total_employees,
      0
    );

    const tested = Math.max(
      data.employees_tested,
      0
    );

    const totalTests = Math.max(
      data.total_tests,
      0
    );

    const risk = Math.max(
      data.at_risk_count,
      0
    );

    const notTested = Math.max(
      totalEmployees - tested,
      0
    );

    const withoutRisk = Math.max(
      tested - risk,
      0
    );

    const participationRate =
      totalEmployees > 0
        ? (tested /
            totalEmployees) *
          100
        : 0;

    const riskRate =
      tested > 0
        ? (risk / tested) * 100
        : 0;

    const averageTests =
      tested > 0
        ? totalTests / tested
        : 0;

    return {
      totalEmployees,
      tested,
      totalTests,
      risk,
      notTested,
      withoutRisk,
      participationRate,
      riskRate,
      averageTests,
    };
  }, [data]);

  // ───────────────────────────────────────────────────────────
  // GRÁFICOS
  // ───────────────────────────────────────────────────────────

  const coverageData = metrics
    ? [
        {
          name: "Avaliados",
          value: metrics.tested,
          color: "#2563eb",
        },
        {
          name: "Ainda não avaliados",
          value: metrics.notTested,
          color: "#e2e8f0",
        },
      ]
    : [];

  const riskData = metrics
    ? [
        {
          name: "Sem indicação de risco",
          value: metrics.withoutRisk,
          color: "#10b981",
        },
        {
          name: "Com indicação de risco",
          value: metrics.risk,
          color: "#f59e0b",
        },
      ]
    : [];

  const overviewData = metrics
    ? [
        {
          name: "Cadastrados",
          quantidade:
            metrics.totalEmployees,
        },
        {
          name: "Avaliados",
          quantidade:
            metrics.tested,
        },
        {
          name: "Avaliações",
          quantidade:
            metrics.totalTests,
        },
        {
          name: "Em risco",
          quantidade:
            metrics.risk,
        },
      ]
    : [];

  // ───────────────────────────────────────────────────────────
  // IMPRESSÃO
  // ───────────────────────────────────────────────────────────

  function handleExport() {
    window.print();
  }

  return (
    <div
      className="
        min-h-full

        font-['Manrope',sans-serif]
      "
    >
      <div className="mx-auto max-w-[1500px]">
        {/* =================================================== */}
        {/* HEADER                                              */}
        {/* =================================================== */}

        <header
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

                tracking-[0.2em]

                text-emerald-700
              "
            >
              Inteligência gerencial
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
              Relatórios agregados
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
              Visualize os principais
              indicadores agregados da equipe e
              acompanhe a cobertura das
              avaliações e os sinais de risco.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="
              inline-flex
              h-[46px]

              cursor-pointer

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

              text-slate-700

              shadow-[0_8px_25px_rgba(15,23,42,0.04)]

              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:border-slate-300
              hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]

              lg:self-auto
            "
          >
            <DownloadIcon />

            Exportar relatório
          </button>
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

        {loading && <LoadingState />}

        {/* =================================================== */}
        {/* CONTEÚDO                                            */}
        {/* =================================================== */}

        {!loading &&
          metrics &&
          data && (
            <>
              {/* ============================================= */}
              {/* MÉTRICAS                                     */}
              {/* ============================================= */}

              <div
                className="
                  mt-10

                  grid
                  gap-4

                  sm:grid-cols-2
                  xl:grid-cols-4
                "
              >
                <MetricCard
                  label="Cobertura"
                  value={`${metrics.participationRate.toFixed(
                    0
                  )}%`}
                  helper={`${metrics.tested} de ${metrics.totalEmployees} colaboradores avaliados`}
                  icon={<UsersIcon />}
                  tone="blue"
                />

                <MetricCard
                  label="Avaliações realizadas"
                  value={String(
                    metrics.totalTests
                  )}
                  helper={`${metrics.averageTests.toFixed(
                    1
                  )} avaliação por colaborador avaliado`}
                  icon={<ClipboardIcon />}
                  tone="green"
                />

                <MetricCard
                  label="Sem avaliação"
                  value={String(
                    metrics.notTested
                  )}
                  helper="Colaboradores que ainda não realizaram avaliação"
                  icon={<ChartIcon />}
                  tone="blue"
                />

                <MetricCard
                  label="Indicação de risco"
                  value={`${metrics.riskRate.toFixed(
                    1
                  )}%`}
                  helper={`${metrics.risk} colaboradores entre os avaliados`}
                  icon={<RiskIcon />}
                  tone={
                    metrics.risk > 0
                      ? "amber"
                      : "green"
                  }
                />
              </div>

              {/* ============================================= */}
              {/* GRÁFICOS PRINCIPAIS                          */}
              {/* ============================================= */}

              <div
                className="
                  mt-6

                  grid
                  gap-6

                  xl:grid-cols-2
                "
              >
                {/* COBERTURA */}

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

                          text-blue-600
                        "
                      >
                        Participação
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
                        Cobertura das avaliações
                      </h2>

                      <p
                        className="
                          mt-2

                          text-sm
                          font-light

                          text-slate-400
                        "
                      >
                        Relação entre colaboradores
                        avaliados e ainda não
                        avaliados.
                      </p>
                    </div>

                    <span
                      className="
                        h-2
                        w-2

                        shrink-0

                        rounded-full

                        bg-blue-500
                      "
                    />
                  </div>

                  <div
                    className="
                      mt-8

                      grid
                      items-center
                      gap-6

                      md:grid-cols-[1.05fr_0.95fr]
                    "
                  >
                    {/* DONUT */}

                    <div
                      className="
                        relative

                        h-[280px]
                      "
                    >
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={
                              coverageData
                            }
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={78}
                            outerRadius={110}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {coverageData.map(
                              (
                                item,
                                index
                              ) => (
                                <Cell
                                  key={index}
                                  fill={
                                    item.color
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip
                            content={
                              <ChartTooltip />
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* CENTRO */}

                      <div
                        className="
                          pointer-events-none

                          absolute
                          left-1/2
                          top-1/2

                          -translate-x-1/2
                          -translate-y-1/2

                          text-center
                        "
                      >
                        <p
                          className="
                            text-4xl
                            font-light

                            tracking-[-0.055em]

                            text-slate-950
                          "
                        >
                          {metrics.participationRate.toFixed(
                            0
                          )}
                          %
                        </p>

                        <p
                          className="
                            mt-1

                            text-[10px]
                            font-medium
                            uppercase

                            tracking-[0.12em]

                            text-slate-400
                          "
                        >
                          cobertura
                        </p>
                      </div>
                    </div>

                    {/* LEGENDA */}

                    <div className="space-y-5">
                      <ReportLegend
                        color="bg-blue-600"
                        label="Avaliados"
                        value={
                          metrics.tested
                        }
                      />

                      <ReportLegend
                        color="bg-slate-200"
                        label="Ainda não avaliados"
                        value={
                          metrics.notTested
                        }
                      />

                      <div
                        className="
                          mt-6

                          rounded-[18px]

                          bg-blue-50/70

                          p-4
                        "
                      >
                        <p
                          className="
                            text-xs
                            font-light
                            leading-5

                            text-blue-800
                          "
                        >
                          {metrics.notTested >
                          0
                            ? `${metrics.notTested} colaboradores ainda precisam realizar a avaliação.`
                            : "Todos os colaboradores cadastrados já realizaram avaliação."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* RISCO */}

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
                        Classificações
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
                        Distribuição de risco
                      </h2>

                      <p
                        className="
                          mt-2

                          text-sm
                          font-light

                          text-slate-400
                        "
                      >
                        Distribuição dos
                        colaboradores que já foram
                        avaliados.
                      </p>
                    </div>

                    <span
                      className="
                        h-2
                        w-2

                        shrink-0

                        rounded-full

                        bg-emerald-500
                      "
                    />
                  </div>

                  <div
                    className="
                      mt-8

                      grid
                      items-center
                      gap-6

                      md:grid-cols-[1.05fr_0.95fr]
                    "
                  >
                    <div
                      className="
                        relative
                        h-[280px]
                      "
                    >
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={riskData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={78}
                            outerRadius={110}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {riskData.map(
                              (
                                item,
                                index
                              ) => (
                                <Cell
                                  key={index}
                                  fill={
                                    item.color
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip
                            content={
                              <ChartTooltip />
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div
                        className="
                          pointer-events-none

                          absolute
                          left-1/2
                          top-1/2

                          -translate-x-1/2
                          -translate-y-1/2

                          text-center
                        "
                      >
                        <p
                          className="
                            text-4xl
                            font-light

                            tracking-[-0.055em]

                            text-slate-950
                          "
                        >
                          {metrics.riskRate.toFixed(
                            1
                          )}
                          %
                        </p>

                        <p
                          className="
                            mt-1

                            text-[10px]
                            font-medium
                            uppercase

                            tracking-[0.12em]

                            text-slate-400
                          "
                        >
                          em risco
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <ReportLegend
                        color="bg-emerald-500"
                        label="Sem indicação de risco"
                        value={
                          metrics.withoutRisk
                        }
                      />

                      <ReportLegend
                        color="bg-amber-500"
                        label="Com indicação de risco"
                        value={
                          metrics.risk
                        }
                      />

                      <div
                        className={`
                          mt-6

                          rounded-[18px]

                          p-4

                          ${
                            metrics.risk > 0
                              ? "bg-amber-50"
                              : "bg-emerald-50"
                          }
                        `}
                      >
                        <p
                          className={`
                            text-xs
                            font-light
                            leading-5

                            ${
                              metrics.risk > 0
                                ? "text-amber-800"
                                : "text-emerald-800"
                            }
                          `}
                        >
                          {metrics.risk > 0
                            ? `${metrics.risk} colaboradores apresentam indicação de risco nos dados agregados.`
                            : "Nenhum colaborador avaliado está contabilizado no indicador de risco."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* ============================================= */}
              {/* VISÃO CONSOLIDADA + LEITURA                  */}
              {/* ============================================= */}

              <div
                className="
                  mt-6

                  grid
                  gap-6

                  xl:grid-cols-[1.35fr_0.65fr]
                "
              >
                {/* BARRAS */}

                <Panel className="p-7 sm:p-8">
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
                      Consolidação
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
                      Visão geral dos indicadores
                    </h2>

                    <p
                      className="
                        mt-2

                        text-sm
                        font-light

                        text-slate-400
                      "
                    >
                      Comparação dos números
                      atualmente disponíveis para a
                      empresa.
                    </p>
                  </div>

                  <div className="mt-8 h-[330px]">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={
                          overviewData
                        }
                        barCategoryGap="32%"
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="#e2e8f0"
                          strokeDasharray="4 8"
                        />

                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#94a3b8",
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#94a3b8",
                            fontSize: 11,
                          }}
                        />

                        <Tooltip
                          cursor={{
                            fill:
                              "rgba(15,23,42,0.025)",
                          }}
                          content={
                            <ChartTooltip />
                          }
                        />

                        <Bar
                          dataKey="quantidade"
                          name="Quantidade"
                          fill="#2563eb"
                          radius={[
                            10,
                            10,
                            0,
                            0,
                          ]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                {/* LEITURA */}

                <Panel className="p-7 sm:p-8">
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.18em]

                      text-emerald-600
                    "
                  >
                    Leitura
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
                    Resumo gerencial
                  </h2>

                  <div className="mt-8 space-y-6">
                    <SummaryItem
                      label="Equipe"
                      value={`${metrics.totalEmployees} colaboradores cadastrados`}
                    />

                    <SummaryDivider />

                    <SummaryItem
                      label="Participação"
                      value={`${metrics.participationRate.toFixed(
                        0
                      )}% da equipe já foi avaliada`}
                    />

                    <SummaryDivider />

                    <SummaryItem
                      label="Avaliações"
                      value={`${metrics.totalTests} avaliações realizadas`}
                    />

                    <SummaryDivider />

                    <SummaryItem
                      label="Risco"
                      value={`${metrics.riskRate.toFixed(
                        1
                      )}% dos avaliados estão no indicador de risco`}
                    />
                  </div>
                </Panel>
              </div>

              {/* ============================================= */}
              {/* PRIVACIDADE                                  */}
              {/* ============================================= */}

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
                      Indicadores apresentados de
                      forma agregada
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
                      Esta área deve apresentar
                      informações consolidadas da
                      equipe, evitando a exposição
                      individual das respostas dos
                      colaboradores.
                    </p>
                  </div>
                </div>
              </div>

              {/* ============================================= */}
              {/* FUTURO                                       */}
              {/* ============================================= */}

              <Panel className="mt-6 p-7 sm:p-8">
                <div
                  className="
                    flex
                    flex-col

                    gap-6

                    lg:flex-row
                    lg:items-center
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

                        text-slate-400
                      "
                    >
                      Próxima evolução
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
                      Relatórios por período
                    </h2>

                    <p
                      className="
                        mt-2

                        max-w-2xl

                        text-sm
                        font-light
                        leading-6

                        text-slate-400
                      "
                    >
                      Quando o backend disponibilizar
                      dados históricos, esta área
                      poderá comparar meses,
                      apresentar evolução dos
                      indicadores e gerar relatórios
                      por intervalo de datas.
                    </p>
                  </div>

                  <span
                    className="
                      inline-flex

                      shrink-0

                      rounded-full

                      bg-slate-100

                      px-4
                      py-2

                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.14em]

                      text-slate-400
                    "
                  >
                    Em breve
                  </span>
                </div>
              </Panel>
            </>
          )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEGENDA
// ─────────────────────────────────────────────────────────────

function ReportLegend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
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
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <span
          className={`
            h-2.5
            w-2.5

            shrink-0

            rounded-full

            ${color}
          `}
        />

        <span
          className="
            text-sm
            font-light

            text-slate-500
          "
        >
          {label}
        </span>
      </div>

      <span
        className="
          text-sm
          font-medium

          text-slate-950
        "
      >
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────

function SummaryItem({
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
          text-[10px]
          font-medium
          uppercase

          tracking-[0.14em]

          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2

          text-lg
          font-light
          leading-7

          tracking-[-0.02em]

          text-slate-800
        "
      >
        {value}
      </p>
    </div>
  );
}

function SummaryDivider() {
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