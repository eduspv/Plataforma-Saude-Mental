import {
  useEffect,
  useMemo,
  useState,
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

import { Link } from "react-router-dom";

import { api } from "../../lib/api";

import ErrorMessage from "../../components/ui/ErrorMessage";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type CompanyDashboardData = {
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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12" />
      <path d="m12 6 4 4-4 4" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD DE MÉTRICA
// ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "amber";
}) {
  const toneClasses = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      glow: "bg-blue-300/20",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-700",
      glow: "bg-emerald-300/20",
    },

    amber: {
      icon: "bg-amber-50 text-amber-700",
      glow: "bg-amber-300/20",
    },
  };

  const styles = toneClasses[tone];

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

        shadow-[0_15px_50px_rgba(15,23,42,0.05)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_25px_70px_rgba(15,23,42,0.09)]
      "
    >
      <div
        className={`
          pointer-events-none

          absolute
          -right-16
          -top-16

          h-40
          w-40

          rounded-full

          blur-[55px]

          ${styles.glow}
        `}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`
              flex
              h-10
              w-10

              items-center
              justify-center

              rounded-[14px]

              ${styles.icon}
            `}
          >
            {icon}
          </div>

          <span className="h-2 w-2 rounded-full bg-slate-200" />
        </div>

        <p
          className="
            mt-8

            text-[11px]
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

            text-4xl
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
// CARD BASE
// ─────────────────────────────────────────────────────────────

function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        rounded-[30px]

        border
        border-slate-200/80

        bg-white

        p-6

        shadow-[0_15px_50px_rgba(15,23,42,0.045)]

        sm:p-7

        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 rounded bg-slate-200" />

      <div className="mt-3 h-12 w-72 rounded bg-slate-200" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="
                h-[210px]
                rounded-[28px]
                bg-slate-200/70
              "
            />
          )
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="h-[420px] rounded-[30px] bg-slate-200/70" />
        <div className="h-[420px] rounded-[30px] bg-slate-200/70" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] =
    useState<CompanyDashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ───────────────────────────────────────────────────────────
  // API
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
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
            "Não foi possível carregar os dados do dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // MÉTRICAS DERIVADAS
  // ───────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    if (!data) {
      return null;
    }

    const totalEmployees =
      Math.max(
        data.total_employees,
        0
      );

    const tested =
      Math.max(
        data.employees_tested,
        0
      );

    const risk =
      Math.max(
        data.at_risk_count,
        0
      );

    const totalTests =
      Math.max(
        data.total_tests,
        0
      );

    const notTested =
      Math.max(
        totalEmployees - tested,
        0
      );

    const withoutRisk =
      Math.max(
        tested - risk,
        0
      );

    const participationRate =
      totalEmployees > 0
        ? (tested / totalEmployees) * 100
        : 0;

    const riskRate =
      tested > 0
        ? (risk / tested) * 100
        : 0;

    const testsPerEmployee =
      tested > 0
        ? totalTests / tested
        : 0;

    return {
      totalEmployees,
      tested,
      risk,
      totalTests,
      notTested,
      withoutRisk,

      participationRate,
      riskRate,
      testsPerEmployee,
    };
  }, [data]);

  // ───────────────────────────────────────────────────────────
  // DADOS DOS GRÁFICOS
  // ───────────────────────────────────────────────────────────

  const participationData =
    metrics
      ? [
          {
            name: "Avaliados",
            value: metrics.tested,
            color: "#2563eb",
          },
          {
            name: "Não avaliados",
            value: metrics.notTested,
            color: "#e2e8f0",
          },
        ]
      : [];

  const riskData =
    metrics
      ? [
          {
            name: "Sem indicação de risco",
            value: metrics.withoutRisk,
            color: "#10b981",
          },
          {
            name: "Em risco",
            value: metrics.risk,
            color: "#f59e0b",
          },
        ]
      : [];

  const comparisonData =
    metrics
      ? [
          {
            name: "Cadastrados",
            value:
              metrics.totalEmployees,
          },
          {
            name: "Avaliados",
            value:
              metrics.tested,
          },
          {
            name: "Testes",
            value:
              metrics.totalTests,
          },
          {
            name: "Em risco",
            value:
              metrics.risk,
          },
        ]
      : [];

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <div
      className="
        min-h-full

        bg-[#f8f9fa]

        px-4
        py-6

        font-['Manrope',sans-serif]

        sm:px-6
        lg:px-8
      "
    >
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================== */}
        {/* CABEÇALHO                                           */}
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
              Saúde mental corporativa
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
              Visão geral
            </h1>

            <p
              className="
                mt-3

                max-w-xl

                text-sm
                font-light
                leading-7

                text-slate-500
              "
            >
              Acompanhe a participação da
              equipe, o volume de avaliações
              e os principais indicadores do
              ambiente psicossocial.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <Link
              to="/empresa/colaboradores"
              className="
                inline-flex

                items-center
                justify-center
                gap-2

                rounded-[16px]

                border
                border-slate-200

                bg-white

                px-5
                py-3

                text-sm
                font-medium

                text-slate-700

                shadow-sm

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:border-slate-300
              "
            >
              Ver colaboradores
            </Link>

            <Link
              to="/empresa/relatorios"
              className="
                group

                inline-flex

                items-center
                justify-center
                gap-2

                rounded-[16px]

                bg-slate-950

                px-5
                py-3

                text-sm
                font-medium

                text-white

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:bg-slate-900
              "
            >
              Relatórios

              <span
                className="
                  transition-transform
                  duration-300

                  group-hover:translate-x-1
                "
              >
                <ArrowIcon />
              </span>
            </Link>
          </div>
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
          <div className="mt-10">
            <DashboardSkeleton />
          </div>
        )}

        {/* =================================================== */}
        {/* DASHBOARD                                           */}
        {/* =================================================== */}

        {!loading &&
          metrics &&
          data && (
            <>
              {/* ============================================= */}
              {/* CARDS PRINCIPAIS                              */}
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
                  label="Colaboradores"
                  value={
                    metrics.totalEmployees
                  }
                  helper="Pessoas cadastradas na empresa"
                  icon={<UsersIcon />}
                  tone="blue"
                />

                <MetricCard
                  label="Avaliados"
                  value={`${Math.round(
                    metrics.participationRate
                  )}%`}
                  helper={`${metrics.tested} de ${metrics.totalEmployees} colaboradores`}
                  icon={<ChartIcon />}
                  tone="green"
                />

                <MetricCard
                  label="Diagnósticos realizados"
                  value={
                    metrics.totalTests
                  }
                  helper={`${metrics.testsPerEmployee.toFixed(
                    1
                  )} avaliação por colaborador avaliado`}
                  icon={
                    <ClipboardIcon />
                  }
                  tone="blue"
                />

                <MetricCard
                  label="Em risco"
                  value={
                    metrics.risk
                  }
                  helper={`${metrics.riskRate.toFixed(
                    1
                  )}% dos colaboradores avaliados`}
                  icon={<RiskIcon />}
                  tone={
                    metrics.risk > 0
                      ? "amber"
                      : "green"
                  }
                />
              </div>

              {/* ============================================= */}
              {/* GRÁFICOS DONUT                                */}
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

                <DashboardCard>
                  <div className="flex items-start justify-between gap-4">
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
                        Cobertura da avaliação
                      </h2>

                      <p
                        className="
                          mt-2

                          text-sm
                          font-light

                          text-slate-400
                        "
                      >
                        Colaboradores que já
                        realizaram pelo menos uma
                        avaliação.
                      </p>
                    </div>

                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>

                  <div
                    className="
                      mt-8

                      grid
                      items-center
                      gap-8

                      md:grid-cols-[1fr_0.8fr]
                    "
                  >
                    <div className="h-[280px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={
                              participationData
                            }
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={78}
                            outerRadius={108}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {participationData.map(
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

                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* centro visual poderia ser feito
                          com SVG customizado depois */}
                    </div>

                    <div>
                      <p
                        className="
                          text-5xl
                          font-light

                          tracking-[-0.06em]

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
                          mt-2

                          text-sm
                          font-light

                          text-slate-500
                        "
                      >
                        da equipe avaliada
                      </p>

                      <div className="mt-7 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />

                            <span className="text-sm text-slate-500">
                              Avaliados
                            </span>
                          </div>

                          <span className="text-sm font-medium text-slate-950">
                            {metrics.tested}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />

                            <span className="text-sm text-slate-500">
                              Pendentes
                            </span>
                          </div>

                          <span className="text-sm font-medium text-slate-950">
                            {
                              metrics.notTested
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                {/* RISCO */}

                <DashboardCard>
                  <div className="flex items-start justify-between gap-4">
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
                        Risco psicossocial
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
                        Distribuição dos avaliados
                      </h2>

                      <p
                        className="
                          mt-2

                          text-sm
                          font-light

                          text-slate-400
                        "
                      >
                        Distribuição baseada nos
                        colaboradores que já
                        realizaram avaliação.
                      </p>
                    </div>

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>

                  <div
                    className="
                      mt-8

                      grid
                      items-center
                      gap-8

                      md:grid-cols-[1fr_0.8fr]
                    "
                  >
                    <div className="h-[280px]">
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
                            outerRadius={108}
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

                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <p
                        className="
                          text-5xl
                          font-light

                          tracking-[-0.06em]

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
                          mt-2

                          text-sm
                          font-light

                          text-slate-500
                        "
                      >
                        dos avaliados com indicação
                        de risco
                      </p>

                      <div className="mt-7 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                            <span className="text-sm text-slate-500">
                              Sem indicação
                            </span>
                          </div>

                          <span className="text-sm font-medium text-slate-950">
                            {
                              metrics.withoutRisk
                            }
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

                            <span className="text-sm text-slate-500">
                              Em risco
                            </span>
                          </div>

                          <span className="text-sm font-medium text-slate-950">
                            {metrics.risk}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              {/* ============================================= */}
              {/* GRÁFICO GERAL + RESUMO                        */}
              {/* ============================================= */}

              <div
                className="
                  mt-6

                  grid
                  gap-6

                  xl:grid-cols-[1.45fr_0.55fr]
                "
              >
                {/* COMPARATIVO */}

                <DashboardCard>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.18em]

                      text-blue-600
                    "
                  >
                    Indicadores
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
                    Visão consolidada
                  </h2>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light

                      text-slate-400
                    "
                  >
                    Comparação dos principais
                    números atualmente disponíveis
                    para a empresa.
                  </p>

                  <div className="mt-8 h-[330px]">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={
                          comparisonData
                        }
                        barCategoryGap="30%"
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
                            fontSize: 12,
                          }}
                        />

                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#94a3b8",
                            fontSize: 12,
                          }}
                        />

                        <Tooltip
                          cursor={{
                            fill:
                              "rgba(15,23,42,0.025)",
                          }}
                          contentStyle={{
                            borderRadius: 16,
                            border:
                              "1px solid #e2e8f0",
                            boxShadow:
                              "0 15px 40px rgba(15,23,42,0.08)",
                          }}
                        />

                        <Bar
                          dataKey="value"
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
                </DashboardCard>

                {/* RESUMO */}

                <DashboardCard>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.18em]

                      text-emerald-600
                    "
                  >
                    Resumo
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
                    Leitura rápida
                  </h2>

                  <div className="mt-8 space-y-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                        Participação
                      </p>

                      <p className="mt-2 text-lg font-light leading-7 text-slate-800">
                        {metrics.tested} de{" "}
                        {
                          metrics.totalEmployees
                        }{" "}
                        colaboradores já foram
                        avaliados.
                      </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                        Pendentes
                      </p>

                      <p className="mt-2 text-lg font-light leading-7 text-slate-800">
                        {
                          metrics.notTested
                        }{" "}
                        colaboradores ainda não
                        realizaram avaliação.
                      </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                        Atenção
                      </p>

                      <p className="mt-2 text-lg font-light leading-7 text-slate-800">
                        {metrics.risk}{" "}
                        colaboradores avaliados
                        estão classificados no
                        indicador de risco.
                      </p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              {/* ============================================= */}
              {/* AÇÕES RÁPIDAS                                 */}
              {/* ============================================= */}

              <div className="mt-6">
                <DashboardCard>
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

                          text-emerald-600
                        "
                      >
                        Gestão
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
                        Ações rápidas
                      </h2>

                      <p className="mt-2 text-sm font-light text-slate-400">
                        Acesse rapidamente as
                        principais áreas da
                        plataforma.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-8

                      grid
                      gap-3

                      sm:grid-cols-2
                      xl:grid-cols-4
                    "
                  >
                    <QuickAction
                      to="/empresa/colaboradores"
                      title="Colaboradores"
                      description="Cadastrar e gerenciar equipe"
                    />

                    <QuickAction
                      to="/empresa/diagnosticos"
                      title="Diagnósticos"
                      description="Visualizar avaliações realizadas"
                    />

                    <QuickAction
                      to="/empresa/riscos"
                      title="Indicadores de risco"
                      description="Acompanhar dados psicossociais"
                    />

                    <QuickAction
                      to="/empresa/relatorios"
                      title="Relatórios"
                      description="Consultar informações gerenciais"
                    />
                  </div>
                </DashboardCard>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUICK ACTION
// ─────────────────────────────────────────────────────────────

function QuickAction({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="
        group

        relative

        overflow-hidden

        rounded-[22px]

        border
        border-slate-200/80

        bg-slate-50/60

        p-5

        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-blue-200
        hover:bg-white
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]
      "
    >
      <div
        className="
          pointer-events-none

          absolute
          -right-12
          -top-12

          h-28
          w-28

          rounded-full

          bg-blue-200/20

          blur-[45px]

          transition-transform
          duration-500

          group-hover:scale-125
        "
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <p
            className="
              text-sm
              font-medium

              text-slate-900
            "
          >
            {title}
          </p>

          <span
            className="
              text-slate-400

              transition-all
              duration-300

              group-hover:translate-x-1
              group-hover:text-blue-600
            "
          >
            <ArrowIcon />
          </span>
        </div>

        <p
          className="
            mt-2

            max-w-[220px]

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