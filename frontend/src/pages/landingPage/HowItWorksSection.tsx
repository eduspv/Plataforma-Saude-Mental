import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

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
// PASSOS
// ─────────────────────────────────────────────────────────────

const passos = [
  {
    numero: "01",
    pequeno: "Primeiro passo",
    titulo: "Cadastre sua empresa e sua equipe",
    texto:
      "Escolha o plano ideal, cadastre os colaboradores e libere o acesso à plataforma em poucos minutos.",
    tom: "blue",
  },
  {
    numero: "02",
    pequeno: "Segundo passo",
    titulo: "Cada colaborador realiza a triagem",
    texto:
      "A avaliação é individual, simples e privada. Cada pessoa responde no próprio tempo, sem exposição das respostas à empresa.",
    tom: "green",
  },
  {
    numero: "03",
    pequeno: "Terceiro passo",
    titulo: "Transforme sinais em prevenção",
    texto:
      "A empresa acompanha indicadores agregados e utiliza essas informações para agir antes que os riscos se transformem em problemas maiores.",
    tom: "blue",
  },
];

// ─────────────────────────────────────────────────────────────
// STEP CARD
// ─────────────────────────────────────────────────────────────

function StepCard({
  numero,
  pequeno,
  titulo,
  texto,
  tom,
}: {
  numero: string;
  pequeno: string;
  titulo: string;
  texto: string;
  tom: string;
}) {
  const verde = tom === "green";

  return (
    <div
      className="
        group
        relative
        h-full
        min-h-[390px]
        overflow-hidden
        rounded-[34px]
        border
        border-slate-200/80
        bg-white/80
        p-7
        shadow-[0_18px_60px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-500
        hover:-translate-y-2
        hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]
        sm:p-8
        lg:p-9
      "
    >
      {/* glow */}
      <div
        className={`
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-60
          w-60
          rounded-full
          blur-[70px]
          transition-all
          duration-700
          group-hover:scale-125
          ${verde ? "bg-emerald-300/20" : "bg-blue-300/20"}
        `}
      />

      {/* número gigante */}
      <span
        className={`
          pointer-events-none
          absolute
          -right-3
          -top-8
          font-['Cormorant_Garamond',serif]
          text-[150px]
          font-medium
          leading-none
          tracking-[-0.07em]
          transition-all
          duration-700
          group-hover:-translate-x-2
          group-hover:translate-y-2
          ${verde ? "text-emerald-500/[0.07]" : "text-blue-500/[0.07]"}
        `}
      >
        {numero}
      </span>

      {/* topo */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className={`
            text-xs
            font-semibold
            tracking-[0.18em]
            ${verde ? "text-emerald-600" : "text-blue-600"}
          `}
        >
          {numero}
        </span>

        <span
          className={`
            h-2
            w-2
            rounded-full
            ${verde ? "bg-emerald-500" : "bg-blue-500"}
          `}
        />
      </div>

      {/* conteúdo */}
      <div className="relative z-10 flex h-[290px] flex-col justify-end">
        <p
          className={`
            mb-4
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            ${verde ? "text-emerald-600" : "text-blue-600"}
          `}
        >
          {pequeno}
        </p>

        <h3
          className="
            max-w-[310px]
            font-['Cormorant_Garamond',serif]
            text-3xl
            font-medium
            leading-[1]
            tracking-[-0.035em]
            text-slate-950
            sm:text-[34px]
          "
        >
          {titulo}
        </h3>

        <p
          className="
            mt-5
            max-w-[320px]
            text-sm
            leading-7
            text-slate-500
          "
        >
          {texto}
        </p>
      </div>

      {/* linha inferior */}
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
          ${verde ? "bg-emerald-500" : "bg-blue-500"}
        `}
      />
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// HOW IT WORKS SECTION
// ─────────────────────────────────────────────────────────────

export default function HowItWorksSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-white
        font-['Manrope',sans-serif]
      "
    >
      {/* fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-48 top-[20%] h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-[140px]" />
        <div className="absolute -right-48 bottom-[10%] h-[500px] w-[500px] rounded-full bg-emerald-100/50 blur-[140px]" />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          py-28
          sm:py-36
          lg:py-44
        "
      >
        {/* cabeçalho */}
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Do cadastro à prevenção
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
            Como
            <br />
            <span className="font-normal italic text-slate-500">
              funciona.
            </span>
          </h2>

          <p className="mx-auto mt-9 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
            Três passos simples para transformar informações
            em uma rotina de prevenção dentro da sua empresa.
          </p>
        </Reveal>

        {/* etapas */}
        <div className="relative mt-20 grid gap-6 md:grid-cols-3 lg:mt-28">
          <div
            className="
              pointer-events-none
              absolute
              left-[16%]
              right-[16%]
              top-1/2
              hidden
              h-px
              bg-gradient-to-r
              from-blue-200
              via-emerald-200
              to-blue-200
              md:block
            "
          />

          {passos.map((passo, index) => (
            <Reveal
              key={passo.numero}
              delayMs={index * 130}
              className="relative z-10"
            >
              <StepCard
                numero={passo.numero}
                pequeno={passo.pequeno}
                titulo={passo.titulo}
                texto={passo.texto}
                tom={passo.tom}
              />
            </Reveal>
          ))}
        </div>

        {/* dashboard */}
        <Reveal delayMs={250} className="mt-20 lg:mt-24">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              Visualização estratégica
            </p>

            <h3
              className="
                font-['Cormorant_Garamond',serif]
                text-4xl
                font-medium
                leading-[0.95]
                tracking-[-0.04em]
                text-slate-950
                sm:text-5xl
                md:text-6xl
              "
            >
              Veja a evolução
              <br />
              <span className="font-normal italic text-slate-500">
                do ambiente.
              </span>
            </h3>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
              A plataforma transforma respostas em indicadores agregados,
              permitindo acompanhar tendências e perceber quando a saúde
              mental do ambiente está melhorando.
            </p>
          </div>
        </Reveal>

        {/* texto final */}
        <Reveal
          delayMs={300}
          className="mx-auto mt-20 flex max-w-2xl flex-col items-center text-center"
        >
          <div className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500" />

          <p className="mt-5 text-sm leading-7 text-slate-400">
            O objetivo não é apenas identificar riscos.
            <br className="hidden sm:block" />
            É criar condições para agir antes que eles se agravem.
          </p>
        </Reveal>
      </div>
    </section>
  );
}