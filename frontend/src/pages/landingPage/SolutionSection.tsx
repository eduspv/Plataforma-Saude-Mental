import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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
        threshold: 0.15,
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
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
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
// VISIBILIDADE CONTÍNUA (entra E sai, ao contrário do useInView
// acima que só dispara uma vez) — usada só pra pausar as
// animações infinitas dos cards quando a seção sai da tela.
// ─────────────────────────────────────────────────────────────

function useSectionVisible<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}


// ─────────────────────────────────────────────────────────────
// BENEFÍCIOS
// ─────────────────────────────────────────────────────────────

const beneficios = [
  {
    numero: "01",
    titulo: "Triagem rápida",
    texto: "Poucos minutos para responder.",
    classe: "solution-card-1",
    tom: "blue",
    fundo: "ondas",
  },
  {
    numero: "02",
    titulo: "Privacidade real",
    texto: "Respostas individuais sempre protegidas.",
    classe: "solution-card-2",
    tom: "green",
    fundo: "orbita",
  },
  {
    numero: "03",
    titulo: "Visão do todo",
    texto: "Indicadores agregados para decisões melhores.",
    classe: "solution-card-3",
    tom: "blue",
    fundo: "conexoes",
  },
  {
    numero: "04",
    titulo: "Antes do afastamento",
    texto: "Sinais para agir de forma preventiva.",
    classe: "solution-card-4",
    tom: "green",
    fundo: "pulso",
  },
  {
    numero: "05",
    titulo: "Conformidade NR-1",
    texto: "Apoio à gestão dos riscos psicossociais.",
    classe: "solution-card-5",
    tom: "blue",
    fundo: "foco",
  },
  {
    numero: "06",
    titulo: "Feito para equipes",
    texto: "Simples para pessoas. Estratégico para empresas.",
    classe: "solution-card-6",
    tom: "green",
    fundo: "acolhimento",
  },
];

type CardTone = "blue" | "green";
type CardBackgroundType =
  | "ondas"
  | "orbita"
  | "conexoes"
  | "pulso"
  | "foco"
  | "acolhimento";

function CardBackground({
  fundo,
  tom,
}: {
  fundo: CardBackgroundType;
  tom: CardTone;
}) {
  const stroke = tom === "green" ? "#10b981" : "#3b82f6";
  const fillSoft = tom === "green" ? "rgba(16,185,129,0.10)" : "rgba(59,130,246,0.10)";
  const fillStrong = tom === "green" ? "rgba(16,185,129,0.18)" : "rgba(59,130,246,0.18)";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      {/* glow */}
      <div
        className={`
          absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl
          ${tom === "green" ? "bg-emerald-300/25" : "bg-blue-300/25"}
        `}
      />

      <svg
        viewBox="0 0 240 180"
        className="absolute inset-0 h-full w-full opacity-[0.32]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {fundo === "ondas" && (
          <>
            <path d="M-20 130C20 110 45 110 78 130C110 150 138 150 170 130C198 112 220 112 260 128" stroke={stroke} strokeWidth="1.5" />
            <path d="M-10 110C24 92 48 92 78 110C108 128 138 128 168 110C198 92 222 92 250 106" stroke={stroke} strokeWidth="1.5" opacity="0.7" />
            <path d="M0 90C25 75 50 75 78 90C108 107 138 107 168 90C198 73 222 74 245 86" stroke={stroke} strokeWidth="1.5" opacity="0.45" />
          </>
        )}

        {fundo === "orbita" && (
          <>
            <circle cx="175" cy="78" r="54" stroke={stroke} strokeWidth="1.4" />
            <circle cx="175" cy="78" r="36" stroke={stroke} strokeWidth="1.2" opacity="0.7" />
            <circle cx="175" cy="78" r="18" fill={fillSoft} stroke={stroke} strokeWidth="1.2" opacity="0.9" />
            <circle cx="129" cy="53" r="4" fill={fillStrong} />
            <circle cx="219" cy="92" r="4" fill={fillStrong} />
          </>
        )}

        {fundo === "conexoes" && (
          <>
            <path d="M62 50L120 88L176 58L206 102L150 132L92 116L62 50Z" stroke={stroke} strokeWidth="1.4" opacity="0.75" />
            <circle cx="62" cy="50" r="5" fill={fillStrong} />
            <circle cx="120" cy="88" r="5" fill={fillStrong} />
            <circle cx="176" cy="58" r="5" fill={fillStrong} />
            <circle cx="206" cy="102" r="5" fill={fillStrong} />
            <circle cx="150" cy="132" r="5" fill={fillStrong} />
            <circle cx="92" cy="116" r="5" fill={fillStrong} />
          </>
        )}

        {fundo === "pulso" && (
          <>
            <path d="M20 115H72L90 84L112 132L132 98H220" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 70C48 54 72 52 88 66C100 78 100 95 88 106L68 126L48 107C35 95 35 78 48 66C60 55 76 55 88 66" fill={fillSoft} opacity="0.55" />
          </>
        )}

        {fundo === "foco" && (
          <>
            <circle cx="178" cy="84" r="42" stroke={stroke} strokeWidth="1.4" opacity="0.7" />
            <circle cx="178" cy="84" r="26" stroke={stroke} strokeWidth="1.4" opacity="0.5" />
            <circle cx="178" cy="84" r="10" fill={fillStrong} />
            <path d="M178 28V46M178 122V140M122 84H140M216 84H234" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
          </>
        )}

        {fundo === "acolhimento" && (
          <>
            <path d="M54 118C54 91 74 72 102 72C123 72 139 84 146 99C152 84 169 72 190 72C218 72 238 91 238 118" stroke={stroke} strokeWidth="1.5" />
            <path d="M72 120C72 101 86 88 105 88C121 88 133 96 138 107C142 96 155 88 171 88C190 88 204 101 204 120" stroke={stroke} strokeWidth="1.2" opacity="0.65" />
            <circle cx="146" cy="108" r="10" fill={fillSoft} />
          </>
        )}
      </svg>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// CARD FLUTUANTE
// ─────────────────────────────────────────────────────────────
function BenefitCard({
  numero,
  titulo,
  texto,
  classe,
  tom,
  fundo,
}: {
  numero: string;
  titulo: string;
  texto: string;
  classe: string;
  tom: CardTone;
  fundo: CardBackgroundType;
}) {
  return (
    <div
      className={`
        ${classe}
        group
        absolute
        z-10
        hidden
        w-[250px]
        overflow-hidden
        rounded-[28px]
        border
        border-white/70
        bg-white/72
        p-5
        shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        backdrop-blur-2xl
        transition-all
        duration-500
        hover:z-30
        hover:-translate-y-2
        hover:scale-[1.04]
        hover:bg-white/95
        hover:shadow-[0_30px_80px_rgba(15,23,42,0.14)]
        md:block
      `}
    >
      <CardBackground fundo={fundo} tom={tom} />

      {/* topo */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
          {numero}
        </span>

        <span
          className={`
            h-2.5 w-2.5 rounded-full
            ${tom === "green" ? "bg-emerald-500" : "bg-blue-500"}
          `}
        />
      </div>

      {/* conteúdo */}
      <h3
        className="
          relative z-10 mt-10
          text-sm font-semibold uppercase
          tracking-[0.12em] text-slate-900
        "
      >
        {titulo}
      </h3>

      <p
        className="
          relative z-10 mt-3
          text-[12px] leading-5 text-slate-500
        "
      >
        {texto}
      </p>

      {/* barra inferior */}
      <div
        className={`
          absolute bottom-0 left-0 h-[3px] w-0
          transition-all duration-500 group-hover:w-full
          ${tom === "green" ? "bg-emerald-500" : "bg-blue-500"}
        `}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SOLUTION SECTION
// ─────────────────────────────────────────────────────────────

export default function SolutionSection() {
  const { ref: sectionRef, visible } = useSectionVisible<HTMLElement>();

  return (
    <section
      ref={sectionRef}
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
      {/* CSS DAS ANIMAÇÕES                                    */}
      {/* ===================================================== */}

      <style>{`

        /*
        ─────────────────────────────────────────────
        MOVIMENTAÇÃO DOS CARDS
        ─────────────────────────────────────────────
        */

        @keyframes cardFloat1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-3deg);
          }

          25% {
            transform: translate3d(35px, -25px, 0) rotate(-1deg);
          }

          50% {
            transform: translate3d(10px, 30px, 0) rotate(2deg);
          }

          75% {
            transform: translate3d(-25px, 10px, 0) rotate(-2deg);
          }
        }

        @keyframes cardFloat2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(3deg);
          }

          30% {
            transform: translate3d(-30px, 25px, 0) rotate(1deg);
          }

          60% {
            transform: translate3d(20px, 35px, 0) rotate(-2deg);
          }
        }

        @keyframes cardFloat3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-2deg);
          }

          33% {
            transform: translate3d(40px, 15px, 0) rotate(2deg);
          }

          66% {
            transform: translate3d(-15px, -30px, 0) rotate(1deg);
          }
        }

        @keyframes cardFloat4 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(2deg);
          }

          35% {
            transform: translate3d(-35px, -25px, 0) rotate(-1deg);
          }

          70% {
            transform: translate3d(15px, 25px, 0) rotate(3deg);
          }
        }

        @keyframes cardFloat5 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-3deg);
          }

          40% {
            transform: translate3d(-20px, 30px, 0) rotate(1deg);
          }

          70% {
            transform: translate3d(30px, -15px, 0) rotate(-1deg);
          }
        }

        @keyframes cardFloat6 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(2deg);
          }

          35% {
            transform: translate3d(30px, -30px, 0) rotate(-2deg);
          }

          70% {
            transform: translate3d(-25px, 20px, 0) rotate(1deg);
          }
        }

        /*
        ─────────────────────────────────────────────
        POSICIONAMENTO
        ─────────────────────────────────────────────
        */

        .solution-card-1 {
          top: 16%;
          left: 6%;
          animation: cardFloat1 14s ease-in-out infinite;
        }

        .solution-card-2 {
          top: 10%;
          right: 8%;
          animation: cardFloat2 17s ease-in-out infinite;
        }

        .solution-card-3 {
          top: 46%;
          left: 2%;
          animation: cardFloat3 16s ease-in-out infinite;
        }

        .solution-card-4 {
          top: 54%;
          right: 3%;
          animation: cardFloat4 15s ease-in-out infinite;
        }

        .solution-card-5 {
          bottom: 10%;
          left: 13%;
          animation: cardFloat5 18s ease-in-out infinite;
        }

        .solution-card-6 {
          bottom: 8%;
          right: 13%;
          animation: cardFloat6 16s ease-in-out infinite;
        }

        /*
        ─────────────────────────────────────────────
        REDUCED MOTION
        ─────────────────────────────────────────────
        */

        @media (prefers-reduced-motion: reduce) {
          .solution-card-1,
          .solution-card-2,
          .solution-card-3,
          .solution-card-4,
          .solution-card-5,
          .solution-card-6 {
            animation: none;
          }
        }

        /*
        ─────────────────────────────────────────────
        PAUSA FORA DA VIEWPORT — mesmo movimento
        enquanto visível, só para de gastar GPU
        quando a seção sai da tela.
        ─────────────────────────────────────────────
        */

        .solution-cards-offscreen .solution-card-1,
        .solution-cards-offscreen .solution-card-2,
        .solution-cards-offscreen .solution-card-3,
        .solution-cards-offscreen .solution-card-4,
        .solution-cards-offscreen .solution-card-5,
        .solution-cards-offscreen .solution-card-6 {
          animation-play-state: paused;
        }
      `}</style>

      {/* ===================================================== */}
      {/* ELEMENTOS DE FUNDO                                   */}
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
        {/* verde */}
        <div
          className="
            absolute
            left-[15%]
            top-[20%]
            h-[380px]
            w-[380px]
            rounded-full
            bg-emerald-200/20
            blur-[120px]
          "
        />

        {/* azul */}
        <div
          className="
            absolute
            bottom-[10%]
            right-[12%]
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-200/20
            blur-[130px]
          "
        />

        {/* centro branco */}
        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[550px]
            w-[700px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/70
            blur-[90px]
          "
        />
      </div>

      {/* ===================================================== */}
      {/* CARDS FLUTUANDO AO FUNDO                             */}
      {/* ===================================================== */}

      <div
        className={`
          pointer-events-auto
          absolute
          inset-0
          z-10
          mx-auto
          max-w-[1600px]

          ${visible ? "" : "solution-cards-offscreen"}
        `}
      >
        {beneficios.map((beneficio) => (
  <BenefitCard
    key={beneficio.titulo}
    numero={beneficio.numero}
    titulo={beneficio.titulo}
    texto={beneficio.texto}
    classe={beneficio.classe}
    tom={beneficio.tom as CardTone}
    fundo={beneficio.fundo as CardBackgroundType}
  />
))}
      </div>

      {/* ===================================================== */}
      {/* CONTEÚDO CENTRAL                                     */}
      {/* ===================================================== */}

      <div
        className="
          relative
          z-20
          mx-auto
          flex
          min-h-[100svh]
          max-w-7xl
          items-center
          justify-center
          px-6
          py-32
        "
      >
        <Reveal
          className="
            mx-auto
            flex
            max-w-5xl
            flex-col
            items-center
            text-center
          "
        >

          {/* TÍTULO */}

          <h2
            className="
              max-w-5xl

              font-['Cormorant_Garamond',serif]

              text-[clamp(4rem,9vw,9rem)]
              font-medium
              leading-[0.78]
              tracking-[-0.055em]
              text-slate-950
            "
          >
            O que a
            <br />

            <span
              className="
                font-normal
                italic
                text-slate-500
              "
            >
              plataforma faz.
            </span>
          </h2>

          {/* SUBTÍTULO */}

          <p
            className="
              mx-auto
              mt-10
              max-w-xl
              text-base
              font-normal
              leading-8
              text-slate-500

              sm:text-lg
            "
          >
            Simples para quem responde.
            <br className="hidden sm:block" />
            Estratégico para quem precisa cuidar da equipe.
          </p>

         {/* LOGO SASBIO */}

<img
  src={sasLogo}
  alt="SASBIO"
  loading="lazy"
  className="
    mt-10
    h-20
    w-auto
    object-contain

    sm:h-24
    md:h-28
  "
/>

{/* LINHA DECORATIVA */}

<div
  className="
    mt-8
    h-px
    w-24
    bg-gradient-to-r
    from-transparent
    via-slate-300
    to-transparent
  "
/>
        </Reveal>
      </div>

      {/* ===================================================== */}
      {/* MOBILE — CARDS                                       */}
      {/* ===================================================== */}

      <div
        className="
          relative
          z-20
          mx-auto
          -mt-20
          grid
          max-w-xl
          gap-3
          px-6
          pb-24

          md:hidden
        "
      >
        {beneficios.map((beneficio) => (
          <div
            key={beneficio.titulo}
            className="
              flex
              items-center
              gap-4
              rounded-[22px]
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-emerald-50
                to-blue-50
                text-emerald-700
              "
            >
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {beneficio.titulo}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {beneficio.texto}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}