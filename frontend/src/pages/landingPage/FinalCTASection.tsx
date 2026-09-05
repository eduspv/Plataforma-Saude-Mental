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
// CTA
// ─────────────────────────────────────────────────────────────

export default function FinalCTASection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-white
        px-6
        py-20
        font-['Manrope',sans-serif]
        sm:py-28
      "
    >
      <Reveal className="mx-auto max-w-[1450px]">
        <div
          className="
            group
            relative
            isolate
            flex
            min-h-[75svh]
            overflow-hidden
            rounded-[44px]
            bg-slate-950
            px-6
            py-20
            shadow-[0_35px_100px_rgba(15,23,42,0.18)]
            sm:px-10
            md:rounded-[60px]
            lg:px-16
          "
        >
          {/* FUNDO */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950" />

            <div
              className="
                absolute
                -left-32
                top-[20%]
                h-[500px]
                w-[500px]
                rounded-full
                bg-blue-500/20
                blur-[140px]
              "
            />

            <div
              className="
                absolute
                -right-32
                bottom-[5%]
                h-[500px]
                w-[500px]
                rounded-full
                bg-emerald-400/20
                blur-[140px]
              "
            />

            {/* círculos decorativos */}
            <div
              className="
                absolute
                right-[8%]
                top-[15%]
                h-52
                w-52
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                absolute
                right-[12%]
                top-[20%]
                h-36
                w-36
                rounded-full
                border
                border-emerald-300/15
              "
            />

            <div
              className="
                absolute
                right-[16%]
                top-[25%]
                h-20
                w-20
                rounded-full
                border
                border-blue-300/15
              "
            />
          </div>

          {/* CONTEÚDO */}
          <div
            className="
              relative
              z-10
              mx-auto
              flex
              w-full
              max-w-5xl
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            {/* LOGO */}
            <img
              src={sasLogo}
              alt="SASBIO"
              loading="lazy"
              className="
                mb-10
                h-20
                w-auto
                object-contain
                brightness-0
                invert
                sm:h-24
              "
            />

            {/* LABEL */}
            <div
              className="
                mb-7
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/15
                bg-white/10
                px-4
                py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-emerald-200
                backdrop-blur-xl
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              Comece agora
            </div>

            {/* TÍTULO */}
            <h2
              className="
                max-w-5xl
                font-['Cormorant_Garamond',serif]
                text-[clamp(4rem,8vw,8rem)]
                font-medium
                leading-[0.8]
                tracking-[-0.055em]
                text-white
              "
            >
              Cuidar começa
              <br />

              <span className="font-normal italic text-white/60">
                antes do problema.
              </span>
            </h2>

            {/* TEXTO */}
            <p
              className="
                mx-auto
                mt-10
                max-w-2xl
                text-base
                leading-8
                text-white/60
                sm:text-lg
              "
            >
              Estruture a prevenção dos riscos psicossociais, acompanhe
              indicadores e transforme informação em decisões melhores para
              sua equipe.
            </p>

            {/* BOTÕES */}
            <div
              className="
                mt-10
                flex
                flex-col
                items-center
                gap-3
                sm:flex-row
              "
            >
              <Link
                to="/planos"
                className="
                  group/button
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-[18px]
                  bg-white
                  px-7
                  py-4
                  text-sm
                  font-semibold
                  text-slate-950
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-emerald-50
                "
              >
                Ver planos disponíveis

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

              <Link
                to="/cadastro"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-[18px]
                  border
                  border-white/15
                  bg-white/5
                  px-7
                  py-4
                  text-sm
                  font-semibold
                  text-white
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:bg-white/10
                "
              >
                Criar minha conta
              </Link>
            </div>

            {/* TEXTO FINAL */}
            <p
              className="
                mt-7
                text-xs
                tracking-wide
                text-white/35
              "
            >
              Contratação online · Implantação simples · Gestão preventiva
            </p>
          </div>

          {/* linha inferior */}
          <div
            className="
              absolute
              bottom-0
              left-0
              h-[4px]
              w-0
              bg-gradient-to-r
              from-blue-500
              to-emerald-400
              transition-all
              duration-1000
              group-hover:w-full
            "
          />
        </div>
      </Reveal>
    </section>
  );
}