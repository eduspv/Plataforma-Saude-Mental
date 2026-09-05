import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import sasLogo from "../../assets/logo/sasbio-logo-semfundo.png";

// ─────────────────────────────────────────────────────────────
// REVEAL
// ─────────────────────────────────────────────────────────────

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: inView ? `${delayMs}ms` : "0ms",
      }}
      className={`
        transition-all
        duration-1000
        ease-out

        ${
          inView
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }

        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHECK
// ─────────────────────────────────────────────────────────────

function Check({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`
        flex
        h-5
        w-5
        shrink-0
        items-center
        justify-center
        rounded-full

        ${
          dark
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-emerald-100 text-emerald-700"
        }
      `}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3 w-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 10 3 3 7-7" />
      </svg>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// SETA
// ─────────────────────────────────────────────────────────────

function ArrowRight() {
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
      <path d="M4 10h12m-4-4 4 4-4 4" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// PLANOS
// ─────────────────────────────────────────────────────────────

const planos = [
  {
    nome: "Inicial",
    descricao:
      "Para empresas que estão começando a estruturar o cuidado com a saúde mental.",
    preco: "R$ —",
    complemento: "/ mês",
    destaque: false,
    gold: false,

    beneficios: [
      "Acesso à plataforma",
      "Triagem inicial",
      "Indicadores agregados",
      "Gestão de colaboradores",
      "Painel empresarial",
    ],
  },

  {
    nome: "Intermediário",
    descricao:
      "Para equipes que precisam acompanhar indicadores com mais frequência.",
    preco: "R$ —",
    complemento: "/ mês",
    destaque: false,
    gold: false,

    beneficios: [
      "Tudo do plano Inicial",
      "Acompanhamento ampliado",
      "Histórico de indicadores",
      "Gestão de riscos psicossociais",
      "Relatórios gerenciais",
    ],
  },

  {
    nome: "Plus",
    descricao:
      "Uma estrutura mais completa para transformar dados em prevenção.",
    preco: "R$ —",
    complemento: "/ mês",
    destaque: true,
    gold: false,

    beneficios: [
      "Tudo do Intermediário",
      "Indicadores avançados",
      "Análise de tendências",
      "Dashboard ampliado",
      "Recursos de prevenção",
    ],
  },

  {
    nome: "Gold",
    descricao:
      "A experiência mais completa para empresas com uma gestão estruturada.",
    preco: "R$ —",
    complemento: "/ mês",
    destaque: false,
    gold: true,

    beneficios: [
      "Tudo do plano Plus",
      "Experiência completa",
      "Recursos avançados",
      "Acompanhamento estratégico",
      "Soluções para grandes equipes",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// PRICING CARD
// ─────────────────────────────────────────────────────────────

function PricingCard({
  plano,
}: {
  plano: (typeof planos)[number];
}) {
  const isGold = plano.gold;
  const isPlus = plano.destaque;

  return (
    <div
      className={`
        group
        relative

        flex
        h-full
        min-h-[560px]
        flex-col

        overflow-hidden

        rounded-[34px]

        border

        p-7

        transition-all
        duration-500

        hover:-translate-y-2

        sm:p-8

        ${
          isGold
            ? `
              border-slate-800
              bg-slate-950
              text-white
              shadow-[0_25px_80px_rgba(15,23,42,0.18)]

              hover:shadow-[0_35px_100px_rgba(15,23,42,0.28)]
            `
            : isPlus
            ? `
              border-emerald-200
              bg-emerald-50/70

              shadow-[0_25px_80px_rgba(16,185,129,0.10)]

              hover:border-emerald-300
              hover:shadow-[0_35px_100px_rgba(16,185,129,0.16)]
            `
            : `
              border-slate-200
              bg-white/80

              shadow-[0_20px_70px_rgba(15,23,42,0.06)]

              hover:border-blue-200
              hover:shadow-[0_30px_90px_rgba(15,23,42,0.10)]
            `
        }
      `}
    >
      {/* =================================================== */}
      {/* GLOW                                                */}
      {/* =================================================== */}

      <div
        className={`
          pointer-events-none

          absolute
          -right-24
          -top-24

          h-64
          w-64

          rounded-full

          blur-[80px]

          transition-transform
          duration-700

          group-hover:scale-125

          ${
            isGold
              ? "bg-emerald-400/15"
              : isPlus
              ? "bg-emerald-300/25"
              : "bg-blue-300/15"
          }
        `}
      />

      {/* =================================================== */}
      {/* ELEMENTO DECORATIVO DE FUNDO                        */}
      {/* =================================================== */}

      <div
        className={`
          pointer-events-none

          absolute
          -right-20
          top-10

          h-44
          w-44

          rounded-full
          border

          transition-all
          duration-700

          group-hover:scale-110

          ${
            isGold
              ? "border-white/[0.04]"
              : isPlus
              ? "border-emerald-500/[0.07]"
              : "border-blue-500/[0.06]"
          }
        `}
      />

      <div
        className={`
          pointer-events-none

          absolute
          -right-8
          top-[72px]

          h-28
          w-28

          rounded-full
          border

          ${
            isGold
              ? "border-white/[0.04]"
              : isPlus
              ? "border-emerald-500/[0.06]"
              : "border-blue-500/[0.05]"
          }
        `}
      />

      {/* =================================================== */}
      {/* TOPO COM LOGO                                       */}
      {/* =================================================== */}

      <div
        className="
          relative
          z-10

          flex
          min-h-[48px]
          items-start
          justify-between
          gap-4
        "
      >
        <img
          src={sasLogo}
          alt="SASBIO"
          loading="lazy"
          className={`
            h-11
            w-auto
            max-w-[150px]
            object-contain
            object-left

            transition-all
            duration-500

            group-hover:scale-[1.03]

            ${
              isGold
                ? "brightness-0 invert opacity-90"
                : ""
            }
          `}
        />

        <span
          className={`
            mt-2
            h-2
            w-2
            shrink-0
            rounded-full

            ${
              isGold
                ? "bg-emerald-400"
                : isPlus
                ? "bg-emerald-500"
                : "bg-blue-500"
            }
          `}
        />
      </div>

      {/* =================================================== */}
      {/* BADGES                                              */}
      {/* =================================================== */}

      <div className="relative z-10 mt-7 min-h-[28px]">
        {isPlus && (
          <span
            className="
              inline-flex

              rounded-full

              bg-emerald-100

              px-3
              py-1.5

              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]

              text-emerald-800
            "
          >
            Mais escolhido
          </span>
        )}

        {isGold && (
          <span
            className="
              inline-flex

              rounded-full

              border
              border-emerald-400/20

              bg-emerald-400/10

              px-3
              py-1.5

              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]

              text-emerald-300
            "
          >
            Experiência completa
          </span>
        )}

        {!isPlus && !isGold && (
          <span
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-slate-400
            "
          >
            Saúde mental corporativa
          </span>
        )}
      </div>

      {/* =================================================== */}
      {/* NOME DO PLANO                                       */}
      {/* =================================================== */}

      <div className="relative z-10 mt-7">
        <h3
          className={`
            font-['Cormorant_Garamond',serif]

            text-4xl
            font-medium

            leading-none
            tracking-[-0.04em]

            ${
              isGold
                ? "text-white"
                : "text-slate-950"
            }
          `}
        >
          {plano.nome}
        </h3>

        <p
          className={`
            mt-4
            min-h-[72px]

            text-sm
            leading-6

            ${
              isGold
                ? "text-white/50"
                : "text-slate-500"
            }
          `}
        >
          {plano.descricao}
        </p>
      </div>

      {/* =================================================== */}
      {/* PREÇO                                               */}
      {/* =================================================== */}

      <div
        className={`
          relative
          z-10

          mt-7

          border-t

          pt-7

          ${
            isGold
              ? "border-white/10"
              : "border-slate-200"
          }
        `}
      >
        <div className="flex items-end gap-2">
          <span
            className={`
              text-4xl
              font-semibold

              tracking-[-0.045em]

              ${
                isGold
                  ? "text-white"
                  : "text-slate-950"
              }
            `}
          >
            {plano.preco}
          </span>

          <span
            className={`
              pb-1

              text-xs

              ${
                isGold
                  ? "text-white/40"
                  : "text-slate-400"
              }
            `}
          >
            {plano.complemento}
          </span>
        </div>
      </div>

      {/* =================================================== */}
      {/* BENEFÍCIOS                                          */}
      {/* =================================================== */}

      <div className="relative z-10 mt-7 flex-1">
        <div className="space-y-3.5">
          {plano.beneficios.map((beneficio) => (
            <div
              key={beneficio}
              className="
                flex
                items-start
                gap-3
              "
            >
              <Check dark={isGold} />

              <span
                className={`
                  text-sm
                  leading-5

                  ${
                    isGold
                      ? "text-white/65"
                      : "text-slate-600"
                  }
                `}
              >
                {beneficio}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================== */}
      {/* BOTÃO                                               */}
      {/* =================================================== */}

      <Link
        to="/planos"
        className={`
          group/button

          relative
          z-10

          mt-8

          inline-flex
          w-full

          items-center
          justify-center
          gap-2

          rounded-[18px]

          px-5
          py-4

          text-sm
          font-semibold

          transition-all
          duration-300

          ${
            isGold
              ? `
                bg-white
                text-slate-950

                hover:bg-emerald-50
              `
              : isPlus
              ? `
                bg-emerald-600
                text-white

                hover:bg-emerald-700
              `
              : `
                bg-slate-950
                text-white

                hover:bg-blue-700
              `
          }
        `}
      >
        Escolher {plano.nome}

        <span
          className="
            transition-transform
            duration-300

            group-hover/button:translate-x-1
          "
        >
          <ArrowRight />
        </span>
      </Link>

      {/* =================================================== */}
      {/* LINHA INFERIOR                                      */}
      {/* =================================================== */}

      <div
        className={`
          absolute
          bottom-0
          left-0

          h-[3px]
          w-0

          transition-all
          duration-500

          group-hover:w-full

          ${
            isGold
              ? "bg-gradient-to-r from-blue-500 to-emerald-400"
              : isPlus
              ? "bg-emerald-500"
              : "bg-blue-500"
          }
        `}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRICING SECTION
// ─────────────────────────────────────────────────────────────

export default function PricingSection() {
  return (
    <section
      className="
        relative
        isolate

        min-h-[100svh]

        overflow-hidden

        bg-[#f9f8f5]

        font-['Manrope',sans-serif]
      "
    >
      {/* ===================================================== */}
      {/* FUNDO                                                */}
      {/* ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
        "
      >
        {/* AZUL */}
        <div
          className="
            absolute
            -left-52
            top-[10%]

            h-[550px]
            w-[550px]

            rounded-full

            bg-blue-100/50

            blur-[150px]
          "
        />

        {/* VERDE */}
        <div
          className="
            absolute
            -right-52
            bottom-[5%]

            h-[550px]
            w-[550px]

            rounded-full

            bg-emerald-100/60

            blur-[150px]
          "
        />

        {/* CENTRO */}
        <div
          className="
            absolute
            left-1/2
            top-[50%]

            h-[500px]
            w-[700px]

            -translate-x-1/2
            -translate-y-1/2

            rounded-full

            bg-white/60

            blur-[120px]
          "
        />
      </div>

      {/* ===================================================== */}
      {/* CONTAINER                                            */}
      {/* ===================================================== */}

      <div
        className="
          mx-auto

          flex
          min-h-[100svh]
          max-w-[1500px]

          flex-col
          justify-center

          px-6

          py-24

          sm:py-32
          lg:py-36
        "
      >
        {/* =================================================== */}
        {/* CABEÇALHO                                           */}
        {/* =================================================== */}

        <Reveal className="mx-auto max-w-5xl text-center">
          <p
            className="
              mb-6

              text-xs
              font-semibold
              uppercase

              tracking-[0.22em]

              text-emerald-700
            "
          >
            Escolha como começar
          </p>

          <h2
            className="
              font-['Cormorant_Garamond',serif]

              text-[clamp(4rem,8vw,8rem)]

              font-medium

              leading-[0.82]

              tracking-[-0.055em]

              text-slate-950
            "
          >
            Planos para
            <br />

            <span
              className="
                font-normal
                italic

                text-slate-500
              "
            >
              cada momento.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-9

              max-w-2xl

              text-base
              leading-8

              text-slate-500

              sm:text-lg
            "
          >
            Comece com a estrutura que faz sentido para sua equipe
            e evolua conforme a gestão de saúde mental da empresa cresce.
          </p>
        </Reveal>

        {/* =================================================== */}
        {/* PLANOS                                              */}
        {/* =================================================== */}

        <div
          className="
            mt-16

            grid
            gap-5

            sm:grid-cols-2
            xl:grid-cols-4

            lg:mt-20
          "
        >
          {planos.map((plano, index) => (
            <Reveal
              key={plano.nome}
              delayMs={index * 120}
              className="h-full"
            >
              <PricingCard plano={plano} />
            </Reveal>
          ))}
        </div>

        {/* =================================================== */}
        {/* RODAPÉ                                             */}
        {/* =================================================== */}

        <Reveal
          delayMs={400}
          className="
            mx-auto
            mt-12
            max-w-2xl
            text-center
          "
        >
          <p className="text-xs leading-6 text-slate-400">
            Os valores e limites de cada plano podem ser ajustados de
            acordo com a quantidade de colaboradores e os recursos
            contratados.
          </p>
        </Reveal>
      </div>
    </section>
  );
}