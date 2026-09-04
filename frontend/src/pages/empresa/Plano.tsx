import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { api } from "../../lib/api";
import ErrorMessage from "../../components/ui/ErrorMessage";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type CompanyPlanDashboardData = {
  name: string;
  max_employees: number;
  price_cents: number;
  currency: string;
  billing_cycle: string;
  payment_method: string;
  users_amount: number;
};

type CompanyPlanDashboardResponse = {
  data: CompanyPlanDashboardData;
  success: boolean;
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatPrice(
  priceCents: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: currency || "BRL",
      }
    ).format(priceCents / 100);
  } catch {
    return `R$ ${(priceCents / 100)
      .toFixed(2)
      .replace(".", ",")}`;
  }
}

function formatBillingCycle(
  billingCycle: string
) {
  const normalized =
    billingCycle.trim().toLowerCase();

  const labels: Record<string, string> = {
    monthly: "Mensal",
    month: "Mensal",
    yearly: "Anual",
    annual: "Anual",
    annually: "Anual",
    quarterly: "Trimestral",
    semiannual: "Semestral",
    semi_annual: "Semestral",
  };

  return labels[normalized] || billingCycle || "—";
}

function formatPaymentMethod(
  paymentMethod: string
) {
  const normalized =
    paymentMethod.trim().toUpperCase();

  const labels: Record<string, string> = {
    PIX: "PIX",
    CREDIT_CARD: "Cartão de crédito",
    BOLETO: "Boleto",
    DEBIT_CARD: "Cartão de débito",
  };

  return labels[normalized] || paymentMethod || "—";
}

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

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
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5a3 3 0 0 1 0 6" />
      <path d="M21 20c0-2.6-1.6-4.8-4-5.6" />
    </svg>
  );
}

function CardIcon() {
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
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
      />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
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
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD BASE
// ─────────────────────────────────────────────────────────────

function Panel({
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

        shadow-[0_15px_50px_rgba(15,23,42,0.045)]

        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INFORMAÇÃO
// ─────────────────────────────────────────────────────────────

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
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

          rounded-[14px]

          bg-slate-50

          text-slate-400
        "
      >
        {icon}
      </span>

      <div className="min-w-0">
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
            mt-1

            text-sm
            font-normal

            text-slate-800
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PLANO
// ─────────────────────────────────────────────────────────────

export default function Plano() {
  const [plan, setPlan] =
    useState<CompanyPlanDashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  // ───────────────────────────────────────────────────────────
  // API
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadPlan() {
      setLoading(true);
      setError("");

      try {
        const response =
          await api.get<CompanyPlanDashboardResponse>(
            "/api/v1/companies/plans-dashboard"
          );

        if (cancelled) {
          return;
        }

        const data = response.data?.data;

        if (!data) {
          throw new Error(
            "Resposta inválida ao carregar o plano."
          );
        }

        setPlan(data);
      } catch (err) {
        console.error(
          "Erro ao carregar plano:",
          err
        );

        if (!cancelled) {
          setError(
            "Não foi possível carregar os dados do plano."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlan();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // ───────────────────────────────────────────────────────────
  // DADOS DERIVADOS
  // ───────────────────────────────────────────────────────────

  const planName =
    loading
      ? "Carregando..."
      : plan?.name || "—";

  const employeesUsed: number | null =
    plan?.users_amount ?? null;

  const employeesLimit: number | null =
    plan?.max_employees ?? null;

  const usagePercentage =
    employeesUsed !== null &&
    employeesLimit !== null &&
    employeesLimit > 0
      ? Math.min(
          (employeesUsed / employeesLimit) * 100,
          100
        )
      : null;

  const planPrice = useMemo(() => {
    if (!plan) {
      return "—";
    }

    return formatPrice(
      plan.price_cents,
      plan.currency
    );
  }, [plan]);

  const billingCycle = useMemo(() => {
    if (!plan) {
      return "—";
    }

    return formatBillingCycle(
      plan.billing_cycle
    );
  }, [plan]);

  const paymentMethod = useMemo(() => {
    if (!plan) {
      return "—";
    }

    return formatPaymentMethod(
      plan.payment_method
    );
  }, [plan]);

  // Ainda não retornado pelo endpoint atual.
  const nextBillingDate = "—";

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
              Assinatura
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
              Plano e assinatura
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
              Acompanhe sua assinatura,
              utilização do plano e informações
              relacionadas à cobrança da empresa.
            </p>
          </div>

          <Link
            to="/empresa/pagamentos"
            className="
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
            <CardIcon />

            Pagamentos
          </Link>
        </header>

        {error && (
          <div className="mt-6">
            <ErrorMessage>
              {error}
            </ErrorMessage>

            <button
              type="button"
              onClick={() =>
                setReloadKey(
                  (prev) => prev + 1
                )
              }
              className="
                mt-3
                inline-flex
                h-10
                items-center
                justify-center
                rounded-[13px]
                border
                border-slate-200
                bg-white
                px-4
                text-xs
                font-medium
                text-slate-700
                transition-all
                hover:border-slate-300
              "
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* =================================================== */}
        {/* PLANO PRINCIPAL                                     */}
        {/* =================================================== */}

        <div
          className="
            mt-10

            grid
            gap-6

            xl:grid-cols-[1.35fr_0.65fr]
          "
        >
          {/* ================================================= */}
          {/* PLANO ATUAL                                       */}
          {/* ================================================= */}

          <div
            className="
              group
              relative

              min-h-[330px]

              overflow-hidden

              rounded-[34px]

              bg-slate-950

              p-7

              text-white

              shadow-[0_25px_70px_rgba(15,23,42,0.16)]

              sm:p-9
            "
          >
            {/* GLOW */}

            <div
              className="
                pointer-events-none

                absolute

                -right-24
                -top-24

                h-[360px]
                w-[360px]

                rounded-full

                bg-blue-500/20

                blur-[100px]
              "
            />

            <div
              className="
                pointer-events-none

                absolute

                -bottom-32
                left-[25%]

                h-[340px]
                w-[340px]

                rounded-full

                bg-emerald-500/20

                blur-[100px]
              "
            />

            {/* CÍRCULOS */}

            <div
              className="
                pointer-events-none

                absolute
                right-14
                top-12

                h-44
                w-44

                rounded-full

                border
                border-white/[0.06]
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                right-[85px]
                top-[78px]

                h-28
                w-28

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
                min-h-[272px]

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
                    Plano atual
                  </p>

                  <h2
                    className="
                      mt-4

                      text-5xl
                      font-light

                      tracking-[-0.06em]

                      text-white

                      sm:text-6xl
                    "
                  >
                    {planName}
                  </h2>
                </div>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-white/10

                    bg-white/[0.06]

                    px-3
                    py-2

                    text-[10px]
                    font-medium
                    uppercase

                    tracking-[0.12em]

                    text-white/60

                    backdrop-blur-xl
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5

                      rounded-full

                      bg-slate-400
                    "
                  />

                  {loading
                    ? "Carregando"
                    : plan
                      ? "Plano contratado"
                      : "Indisponível"}
                </span>
              </div>

              {/* BAIXO */}

              <div
                className="
                  mt-14

                  flex
                  flex-col

                  gap-6

                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >
                <div>
                  <p
                    className="
                      max-w-md

                      text-sm
                      font-light
                      leading-6

                      text-white/50
                    "
                  >
                    Consulte os recursos disponíveis
                    e faça upgrade caso sua empresa
                    precise ampliar a capacidade da
                    plataforma.
                  </p>
                </div>

                <Link
                  to="/empresa/plano/upgrade"
                  className="
                    group/button

                    inline-flex
                    h-[50px]

                    shrink-0

                    items-center
                    justify-center
                    gap-2.5

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
                  Fazer upgrade

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

            {/* LINHA COLORIDA */}

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
          {/* USO DO PLANO                                      */}
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
                  Capacidade
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
                  Uso do plano
                </h2>
              </div>

              <span
                className="
                  flex
                  h-11
                  w-11

                  items-center
                  justify-center

                  rounded-[15px]

                  bg-blue-50

                  text-blue-600
                "
              >
                <UsersIcon />
              </span>
            </div>

            {/* NÚMEROS */}

            <div className="mt-10">
              <div
                className="
                  flex
                  items-end
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-4xl
                      font-light

                      tracking-[-0.055em]

                      text-slate-950
                    "
                  >
                    {employeesUsed ?? "—"}
                  </p>

                  <p
                    className="
                      mt-2

                      text-xs
                      font-light

                      text-slate-400
                    "
                  >
                    colaboradores utilizados
                  </p>
                </div>

                <p
                  className="
                    pb-1

                    text-sm
                    font-light

                    text-slate-400
                  "
                >
                  de {employeesLimit ?? "—"}
                </p>
              </div>

              {/* PROGRESS BAR */}

              <div
                className="
                  mt-7

                  h-2
                  w-full

                  overflow-hidden

                  rounded-full

                  bg-slate-100
                "
              >
                {usagePercentage !== null ? (
                  <div
                    className="
                      h-full

                      rounded-full

                      bg-gradient-to-r
                      from-blue-500
                      to-emerald-500

                      transition-all
                      duration-700
                    "
                    style={{
                      width: `${usagePercentage}%`,
                    }}
                  />
                ) : (
                  <div
                    className="
                      h-full
                      w-[12%]

                      rounded-full

                      bg-slate-200
                    "
                  />
                )}
              </div>

              <div
                className="
                  mt-3

                  flex
                  justify-between

                  text-[10px]
                  font-light

                  text-slate-400
                "
              >
                <span>
                  Utilização
                </span>

                <span>
                  {usagePercentage !== null
                    ? `${usagePercentage.toFixed(0)}%`
                    : "—"}
                </span>
              </div>
            </div>

            <div
              className="
                mt-8

                rounded-[18px]

                bg-slate-50

                p-4
              "
            >
              <p
                className="
                  text-xs
                  font-light
                  leading-5

                  text-slate-500
                "
              >
                {employeesLimit !== null
                  ? `Seu plano permite até ${employeesLimit} colaboradores.`
                  : "O limite de colaboradores varia conforme o plano contratado pela empresa."}
              </p>
            </div>
          </Panel>
        </div>

        {/* =================================================== */}
        {/* ASSINATURA / COBRANÇA                               */}
        {/* =================================================== */}

        <div
          className="
            mt-6

            grid
            gap-6

            xl:grid-cols-[1fr_0.72fr]
          "
        >
          {/* ================================================= */}
          {/* RESUMO DA ASSINATURA                              */}
          {/* ================================================= */}

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
                Assinatura
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
                Resumo da cobrança
              </h2>

              <p
                className="
                  mt-2

                  text-sm
                  font-light

                  text-slate-400
                "
              >
                Informações financeiras vinculadas
                ao plano contratado.
              </p>
            </div>

            <div
              className="
                mt-9

                grid
                gap-x-8
                gap-y-8

                sm:grid-cols-2
              "
            >
              <InfoItem
                icon={<CardIcon />}
                label="Valor do plano"
                value={planPrice}
              />

              <InfoItem
                icon={<CalendarIcon />}
                label="Ciclo de cobrança"
                value={billingCycle}
              />

              <InfoItem
                icon={<CalendarIcon />}
                label="Próximo vencimento"
                value={nextBillingDate}
              />

              <InfoItem
                icon={<CardIcon />}
                label="Forma de pagamento"
                value={paymentMethod}
              />
            </div>

            <div
              className="
                mt-9

                flex
                flex-wrap
                items-center
                justify-between
                gap-4

                border-t
                border-slate-100

                pt-6
              "
            >
              <p
                className="
                  text-xs
                  font-light

                  text-slate-400
                "
              >
                Consulte cobranças, faturas e
                histórico financeiro.
              </p>

              <Link
                to="/empresa/pagamentos"
                className="
                  group

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
                Ver pagamentos

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

          {/* ================================================= */}
          {/* RECURSOS                                          */}
          {/* ================================================= */}

          <Panel className="p-7 sm:p-8">
            <p
              className="
                text-[10px]
                font-medium
                uppercase

                tracking-[0.18em]

                text-blue-600
              "
            >
              Plataforma
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
              Recursos do plano
            </h2>

            <p
              className="
                mt-2

                text-sm
                font-light
                leading-6

                text-slate-400
              "
            >
              Os recursos disponíveis devem ser
              exibidos conforme o plano retornado
              pelo backend.
            </p>

            <div className="mt-8 space-y-4">
              <FeatureItem label="Gestão de colaboradores" />
              <FeatureItem label="Triagens e avaliações" />
              <FeatureItem label="Indicadores agregados" />
              <FeatureItem label="Gestão de riscos psicossociais" />
              <FeatureItem label="Relatórios gerenciais" />
            </div>
          </Panel>
        </div>

        {/* =================================================== */}
        {/* UPGRADE                                             */}
        {/* =================================================== */}

        <div
          className="
            relative

            mt-6

            overflow-hidden

            rounded-[32px]

            border
            border-emerald-200/60

            bg-gradient-to-r
            from-emerald-50
            via-white
            to-blue-50

            p-7

            sm:p-9
          "
        >
          {/* GLOW */}

          <div
            className="
              pointer-events-none

              absolute
              -right-28
              -top-28

              h-72
              w-72

              rounded-full

              bg-blue-300/20

              blur-[90px]
            "
          />

          <div
            className="
              relative
              z-10

              flex
              flex-col

              gap-7

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
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

                  shadow-[0_8px_25px_rgba(15,23,42,0.06)]
                "
              >
                <SparkIcon />
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
                  Cresça sem interromper sua gestão
                </p>

                <h2
                  className="
                    mt-2

                    text-2xl
                    font-light

                    tracking-[-0.035em]

                    text-slate-950

                    sm:text-3xl
                  "
                >
                  Precisa de mais capacidade?
                </h2>

                <p
                  className="
                    mt-2

                    max-w-2xl

                    text-sm
                    font-light
                    leading-6

                    text-slate-500
                  "
                >
                  Compare os planos disponíveis e
                  escolha uma estrutura compatível
                  com o crescimento da sua equipe.
                </p>
              </div>
            </div>

            <Link
              to="/empresa/plano/upgrade"
              className="
                group

                inline-flex
                h-[50px]

                shrink-0

                items-center
                justify-center
                gap-2

                rounded-[16px]

                bg-slate-950

                px-6

                text-sm
                font-medium

                text-white

                shadow-[0_12px_30px_rgba(15,23,42,0.12)]

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:bg-slate-900
              "
            >
              Comparar planos

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
// FEATURE
// ─────────────────────────────────────────────────────────────

function FeatureItem({
  label,
}: {
  label: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
      "
    >
      <span
        className="
          flex
          h-7
          w-7
          shrink-0

          items-center
          justify-center

          rounded-full

          bg-emerald-50

          text-emerald-600
        "
      >
        <CheckIcon />
      </span>

      <span
        className="
          text-sm
          font-light

          text-slate-600
        "
      >
        {label}
      </span>
    </div>
  );
}