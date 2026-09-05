import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import axios from "axios";

import { api } from "../../lib/api";

import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type PaymentSummary = {
  total_paid_cents: number;
  currency: string;
  current_plan_amount_cents: number;
  payment_method: string;
  next_due_date: string | null;
};

type PaymentItem = {
  id: string;
  due_date: string;
  paid_at: string;
  amount_cents: number;
  currency: string;
  payment_method: string;
  status: string;
};

type PaymentHistoryData = {
  summary: PaymentSummary;
  payments: PaymentItem[];
};

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function WalletIcon() {
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
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M4 8h13" />
      <path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
      <circle cx="17.5" cy="13.5" r=".6" fill="currentColor" />
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

function ReceiptIcon() {
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
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
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
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 20h14" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "slate";
}) {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      glow: "bg-blue-300/20",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-600",
      glow: "bg-emerald-300/20",
    },

    slate: {
      icon: "bg-slate-100 text-slate-500",
      glow: "bg-slate-300/20",
    },
  };

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
        hover:shadow-[0_22px_60px_rgba(15,23,42,0.075)]
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

          ${styles[tone].glow}
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

            ${styles[tone].icon}
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

            tracking-[-0.045em]

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
    <div className="mt-10 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[190px] rounded-[28px] bg-slate-200/60"
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-[320px] rounded-[32px] bg-slate-200/60" />
        <div className="h-[320px] rounded-[28px] bg-slate-200/60" />
      </div>

      <div className="mt-6 h-[300px] rounded-[30px] bg-slate-200/60" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGAMENTOS
// ─────────────────────────────────────────────────────────────

export default function Pagamentos() {
  const [data, setData] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscriptionInactive, setSubscriptionInactive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      setError("");
      setSubscriptionInactive(false);

      try {
        const response = await api.get("/api/v1/companies/payments");
        if (!cancelled) {
          setData(response.data.data);
        }
      } catch (err) {
        if (cancelled) return;

        if (axios.isAxiosError(err) && err.response?.status === 402) {
          setSubscriptionInactive(true);
        } else {
          setError(
            "Não foi possível carregar os pagamentos. Tente novamente."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPayments = (data?.payments.length ?? 0) > 0;

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
              Financeiro
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
              Pagamentos
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
              Acompanhe cobranças, vencimentos e
              o histórico financeiro relacionado
              à assinatura da sua empresa.
            </p>
          </div>

          <Link
            to="/empresa/plano"
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
            Ver meu plano

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
        {/* ASSINATURA INATIVA                                 */}
        {/* =================================================== */}

        {subscriptionInactive && (
          <div className="mt-6">
            <ErrorMessage>
              Sua assinatura não está ativa. Ative um plano para
              acompanhar o histórico de pagamentos.
            </ErrorMessage>
          </div>
        )}

        {/* =================================================== */}
        {/* ERRO                                               */}
        {/* =================================================== */}

        {error && (
          <div className="mt-6">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        {/* =================================================== */}
        {/* LOADING                                            */}
        {/* =================================================== */}

        {loading && <LoadingState />}

        {!loading && !subscriptionInactive && !error && data && (
          <>
        {/* =================================================== */}
        {/* RESUMO                                             */}
        {/* =================================================== */}

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
            label="Total pago"
            value={formatPrice(
              data.summary.total_paid_cents,
              data.summary.currency
            )}
            helper="Valor acumulado das cobranças pagas"
            icon={<WalletIcon />}
            tone="green"
          />

          <MetricCard
            label="Próxima cobrança"
            value={
              data.summary.next_due_date
                ? formatDate(data.summary.next_due_date)
                : "A definir"
            }
            helper="Próximo vencimento da assinatura"
            icon={<CalendarIcon />}
            tone="blue"
          />

          <MetricCard
            label="Valor do plano"
            value={formatPrice(
              data.summary.current_plan_amount_cents,
              data.summary.currency
            )}
            helper="Valor atual da assinatura"
            icon={<ReceiptIcon />}
            tone="blue"
          />

          <MetricCard
            label="Forma de pagamento"
            value={data.summary.payment_method || "—"}
            helper="Método utilizado nas cobranças"
            icon={<CardIcon />}
            tone="slate"
          />
        </div>

        {/* =================================================== */}
        {/* PRÓXIMA COBRANÇA + PLANO                           */}
        {/* =================================================== */}

        <div
          className="
            mt-6

            grid
            gap-6

            xl:grid-cols-[1.2fr_0.8fr]
          "
        >
          {/* ================================================= */}
          {/* PRÓXIMA COBRANÇA                                 */}
          {/* ================================================= */}

          <div
            className="
              group
              relative

              overflow-hidden

              rounded-[32px]

              bg-slate-950

              p-7

              text-white

              shadow-[0_20px_60px_rgba(15,23,42,0.13)]

              sm:p-8
            "
          >
            {/* GLOWS */}

            <div
              className="
                pointer-events-none

                absolute
                -right-24
                -top-24

                h-[300px]
                w-[300px]

                rounded-full

                bg-blue-500/20

                blur-[95px]
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                -bottom-28
                left-[20%]

                h-[280px]
                w-[280px]

                rounded-full

                bg-emerald-500/20

                blur-[95px]
              "
            />

            {/* CÍRCULOS */}

            <div
              className="
                pointer-events-none

                absolute
                right-16
                top-10

                h-40
                w-40

                rounded-full

                border
                border-white/[0.05]
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                right-[92px]
                top-[66px]

                h-24
                w-24

                rounded-full

                border
                border-emerald-300/10
              "
            />

            <div className="relative z-10">
              <div
                className="
                  flex
                  flex-wrap
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

                      tracking-[0.2em]

                      text-emerald-300
                    "
                  >
                    Próxima cobrança
                  </p>

                  <p
                    className="
                      mt-4

                      text-5xl
                      font-light

                      tracking-[-0.055em]

                      text-white
                    "
                  >
                    {data.summary.next_due_date
                      ? formatDate(data.summary.next_due_date)
                      : "A definir"}
                  </p>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light

                      text-white/45
                    "
                  >
                    {data.summary.next_due_date
                      ? `Vencimento ${formatDate(data.summary.next_due_date)}`
                      : "Vencimento a definir"}
                  </p>
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

                    text-white/55
                  "
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5

                      rounded-full

                      ${
                        data.summary.next_due_date
                          ? "bg-emerald-400"
                          : "bg-slate-400"
                      }
                    `}
                  />

                  {data.summary.next_due_date
                    ? "Vencimento definido"
                    : "A definir"}
                </span>
              </div>

              <div
                className="
                  mt-14

                  flex
                  flex-col

                  gap-5

                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >
                <p
                  className="
                    max-w-xl

                    text-sm
                    font-light
                    leading-6

                    text-white/50
                  "
                >
                  {data.summary.next_due_date
                    ? "A próxima cobrança da assinatura está agendada para a data acima."
                    : "Assim que o backend disponibilizar os dados da assinatura, a próxima cobrança e o vencimento aparecerão automaticamente aqui."}
                </p>

                <Link
                  to="/empresa/plano"
                  className="
                    group/button

                    inline-flex
                    h-[46px]
                    shrink-0

                    items-center
                    justify-center
                    gap-2

                    rounded-[15px]

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
                  Ver assinatura

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
          {/* MÉTODO DE PAGAMENTO                              */}
          {/* ================================================= */}

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
                  Cobrança
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
                  Método de pagamento
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
                <CardIcon />
              </span>
            </div>

            <div
              className="
                mt-9

                rounded-[22px]

                border
                border-slate-100

                bg-slate-50/70

                p-5
              "
            >
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase

                  tracking-[0.13em]

                  text-slate-400
                "
              >
                Forma cadastrada
              </p>

              <p
                className="
                  mt-3

                  text-xl
                  font-light

                  text-slate-800
                "
              >
                {data.summary.payment_method || "Não cadastrada"}
              </p>

              {!data.summary.payment_method && (
                <p
                  className="
                    mt-2

                    text-xs
                    font-light
                    leading-5

                    text-slate-400
                  "
                >
                  As informações do método de
                  pagamento serão exibidas quando
                  estiverem disponíveis.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled
              className="
                mt-6

                inline-flex
                h-[44px]
                w-full

                cursor-not-allowed

                items-center
                justify-center

                rounded-[14px]

                border
                border-slate-200

                bg-white

                text-sm
                font-medium

                text-slate-300
              "
            >
              Alterar forma de pagamento
            </button>
          </Panel>
        </div>

        {/* =================================================== */}
        {/* HISTÓRICO                                          */}
        {/* =================================================== */}

        <Panel className="mt-6 overflow-hidden">
          {/* CABEÇALHO DA TABELA */}

          <div
            className="
              flex
              flex-col

              gap-5

              border-b
              border-slate-100

              p-7

              sm:p-8

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

                  text-emerald-600
                "
              >
                Financeiro
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
                Histórico de pagamentos
              </h2>

              <p
                className="
                  mt-2

                  text-sm
                  font-light

                  text-slate-400
                "
              >
                Consulte as cobranças relacionadas
                à assinatura da sua empresa.
              </p>
            </div>

            {/* AÇÕES */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <button
                type="button"
                disabled={!hasPayments}
                className="
                  inline-flex
                  h-[42px]

                  items-center
                  justify-center
                  gap-2

                  rounded-[13px]

                  border
                  border-slate-200

                  bg-white

                  px-4

                  text-xs
                  font-medium

                  text-slate-500

                  transition-all

                  enabled:cursor-pointer
                  enabled:hover:border-slate-300
                  enabled:hover:text-slate-800

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FilterIcon />

                Filtrar
              </button>

              <button
                type="button"
                disabled={!hasPayments}
                className="
                  inline-flex
                  h-[42px]

                  items-center
                  justify-center
                  gap-2

                  rounded-[13px]

                  border
                  border-slate-200

                  bg-white

                  px-4

                  text-xs
                  font-medium

                  text-slate-500

                  transition-all

                  enabled:cursor-pointer
                  enabled:hover:border-slate-300
                  enabled:hover:text-slate-800

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <DownloadIcon />

                Exportar
              </button>
            </div>
          </div>

          {/* ================================================= */}
          {/* CONTEÚDO                                         */}
          {/* ================================================= */}

          {!hasPayments ? (
            <div
              className="
                relative
                overflow-hidden

                px-6
                py-16

                sm:px-10
                sm:py-20
              "
            >
              {/* FUNDO */}

              <div
                className="
                  pointer-events-none

                  absolute
                  left-1/2
                  top-1/2

                  h-[320px]
                  w-[320px]

                  -translate-x-1/2
                  -translate-y-1/2

                  rounded-full

                  bg-gradient-to-br
                  from-blue-100/50
                  to-emerald-100/50

                  blur-[90px]
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
                {/* ÍCONE */}

                <div
                  className="
                    mx-auto

                    flex
                    h-16
                    w-16

                    items-center
                    justify-center

                    rounded-[22px]

                    border
                    border-slate-200/80

                    bg-white

                    text-slate-400

                    shadow-[0_12px_35px_rgba(15,23,42,0.06)]
                  "
                >
                  <ReceiptIcon />
                </div>

                <div className="mt-6">
                  <EmptyState>
                    Nenhum pagamento registrado ainda.
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
                  Quando uma cobrança for gerada,
                  ela aparecerá aqui com valor,
                  vencimento, status e acesso aos
                  documentos disponíveis.
                </p>

                <Link
                  to="/empresa/plano"
                  className="
                    group

                    mt-7

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

                    shadow-[0_10px_28px_rgba(15,23,42,0.12)]

                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-slate-900
                  "
                >
                  Ver meu plano

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
          ) : (
            <PaymentTable payments={data.payments} />
          )}
        </Panel>

        {/* =================================================== */}
        {/* RODAPÉ INFORMATIVO                                 */}
        {/* =================================================== */}

        <div
          className="
            mt-6

            rounded-[28px]

            border
            border-blue-100

            bg-gradient-to-r
            from-blue-50/70
            via-white
            to-emerald-50/70

            p-6

            sm:p-7
          "
        >
          <div
            className="
              flex
              flex-col

              gap-5

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
                Precisa alterar sua assinatura?
              </p>

              <p
                className="
                  mt-1

                  max-w-xl

                  text-xs
                  font-light
                  leading-5

                  text-slate-400
                "
              >
                Consulte seu plano atual ou veja
                outras opções disponíveis para sua
                empresa.
              </p>
            </div>

            <Link
              to="/empresa/plano"
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
              Gerenciar plano

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
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TABELA
// ─────────────────────────────────────────────────────────────

function PaymentTable({ payments }: { payments: PaymentItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr
            className="
              border-b
              border-slate-100

              bg-slate-50/60
            "
          >
            <TableHeader>
              Cobrança
            </TableHeader>

            <TableHeader>
              Vencimento
            </TableHeader>

            <TableHeader>
              Valor
            </TableHeader>

            <TableHeader>
              Forma de pagamento
            </TableHeader>

            <TableHeader>
              Status
            </TableHeader>

            <TableHeader align="right">
              Ações
            </TableHeader>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-slate-100 last:border-0"
            >
              <TableCell className="font-mono text-xs">
                {payment.id}
              </TableCell>

              <TableCell>{formatDate(payment.due_date)}</TableCell>

              <TableCell>
                {formatPrice(payment.amount_cents, payment.currency)}
              </TableCell>

              <TableCell>{payment.payment_method}</TableCell>

              <TableCell>
                <StatusBadge status={payment.status} />
              </TableCell>

              <TableCell align="right">—</TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CÉLULA DA TABELA
// ─────────────────────────────────────────────────────────────

function TableCell({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`
        px-7
        py-5

        text-sm
        font-light

        text-slate-700

        ${align === "right" ? "text-right" : "text-left"}

        ${className}
      `}
    >
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
  refunded: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  failed: "Falhou",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`
        inline-flex
        items-center

        rounded-full

        px-2.5
        py-1

        text-[10px]
        font-medium
        uppercase

        tracking-[0.1em]

        ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500"}
      `}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// HEADER DA TABELA
// ─────────────────────────────────────────────────────────────

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`
        px-7
        py-4

        text-[10px]
        font-medium
        uppercase

        tracking-[0.14em]

        text-slate-400

        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
}