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
// CHEVRON
// ─────────────────────────────────────────────────────────────

function Chevron() {
  return (
    <span
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-slate-200
        bg-white
        text-slate-500
        transition-all
        duration-300
        group-open:rotate-180
        group-open:border-emerald-200
        group-open:bg-emerald-50
        group-open:text-emerald-700
      "
    >
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
        <path d="m6 8 4 4 4-4" />
      </svg>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQS
// ─────────────────────────────────────────────────────────────

const faqs = [
  {
    pergunta:
      "A empresa consegue ver as respostas de um colaborador específico?",
    resposta:
      "Não. A empresa acompanha apenas indicadores agregados e anônimos. As respostas individuais de cada triagem são estritamente pessoais e não ficam visíveis para gestores ou RH.",
  },
  {
    pergunta:
      "O resultado da triagem é um diagnóstico médico?",
    resposta:
      "Não. É uma triagem inicial de apoio e organização. Ela não substitui avaliação médica, psicológica ou psiquiátrica profissional e, quando indicado, a plataforma recomenda buscar um profissional habilitado.",
  },
  {
    pergunta:
      "Como funciona a cobrança?",
    resposta:
      "A cobrança é feita por assinatura, com valor de acordo com o número de colaboradores do plano contratado. Os valores podem ser consultados na página de planos.",
  },
  {
    pergunta:
      "Os dados são seguros e estão em conformidade com a LGPD?",
    resposta:
      "Sim. Os dados são tratados com acesso restrito e finalidade específica, seguindo os princípios da LGPD, e nunca são compartilhados de forma individualizada com a empresa contratante.",
  },
  {
    pergunta:
      "A plataforma ajuda a empresa a cumprir a NR-1?",
    resposta:
      "Sim. A triagem estruturada e os indicadores agregados fornecem uma base concreta para identificar e gerenciar riscos psicossociais, apoiando a gestão preventiva prevista na NR-1.",
  },
];

// ─────────────────────────────────────────────────────────────
// FAQ ITEM
// ─────────────────────────────────────────────────────────────

function FAQItem({
  pergunta,
  resposta,
  numero,
}: {
  pergunta: string;
  resposta: string;
  numero: string;
}) {
  return (
    <details
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200/80
        bg-white/85
        shadow-[0_15px_50px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-all
        duration-500
        open:border-emerald-200
        open:shadow-[0_25px_70px_rgba(15,23,42,0.08)]
        [&_summary::-webkit-details-marker]:hidden
      "
    >
      {/* GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-emerald-200/15
          blur-[55px]
          opacity-0
          transition-opacity
          duration-500
          group-open:opacity-100
        "
      />

      <summary
        className="
          relative
          z-10
          flex
          cursor-pointer
          list-none
          items-center
          justify-between
          gap-6
          p-6
          sm:p-7
        "
      >
        <div className="flex items-start gap-5">
          <span
            className="
              mt-1
              text-[10px]
              font-semibold
              tracking-[0.2em]
              text-slate-400
            "
          >
            {numero}
          </span>

          <h3
            className="
              max-w-3xl
              font-['Cormorant_Garamond',serif]
              text-2xl
              font-medium
              leading-[1.05]
              tracking-[-0.03em]
              text-slate-950
              sm:text-3xl
            "
          >
            {pergunta}
          </h3>
        </div>

        <Chevron />
      </summary>

      <div
        className="
          relative
          z-10
          px-6
          pb-7
          sm:px-7
          sm:pb-8
        "
      >
        <div className="ml-0 border-t border-slate-100 pt-5 sm:ml-[46px]">
          <p
            className="
              max-w-3xl
              text-sm
              leading-7
              text-slate-500
              sm:text-base
            "
          >
            {resposta}
          </p>
        </div>
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ SECTION
// ─────────────────────────────────────────────────────────────

export default function FAQSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        font-['Manrope',sans-serif]
      "
    >
      {/* FUNDO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-44 top-[10%] h-[460px] w-[460px] rounded-full bg-blue-100/40 blur-[140px]" />

        <div className="absolute -right-44 bottom-[5%] h-[460px] w-[460px] rounded-full bg-emerald-100/50 blur-[140px]" />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-6xl
          px-6
          py-28
          sm:py-36
          lg:py-40
        "
      >
        {/* CABEÇALHO */}
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
            Tire suas dúvidas
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
            Perguntas
            <br />

            <span
              className="
                font-normal
                italic
                text-slate-500
              "
            >
              frequentes.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-9
              max-w-xl
              text-base
              leading-8
              text-slate-500
              sm:text-lg
            "
          >
            Privacidade, funcionamento, cobrança e conformidade:
            aqui estão as respostas para as principais dúvidas sobre a plataforma.
          </p>
        </Reveal>

        {/* FAQS */}
        <div className="mx-auto mt-16 max-w-4xl space-y-4 lg:mt-20">
          {faqs.map((faq, index) => (
            <Reveal
              key={faq.pergunta}
              delayMs={index * 80}
            >
              <FAQItem
                numero={`0${index + 1}`}
                pergunta={faq.pergunta}
                resposta={faq.resposta}
              />
            </Reveal>
          ))}
        </div>

        {/* TEXTO FINAL */}
        <Reveal
          delayMs={350}
          className="
            mx-auto
            mt-16
            flex
            max-w-2xl
            flex-col
            items-center
            text-center
          "
        >
          <div
            className="
              h-2
              w-2
              rounded-full
              bg-gradient-to-br
              from-blue-500
              to-emerald-500
            "
          />

          <p className="mt-5 text-sm leading-7 text-slate-400">
            Ainda ficou alguma dúvida?
            <br className="hidden sm:block" />
            Nossa equipe pode explicar como a plataforma funciona na prática.
          </p>
        </Reveal>
      </div>
    </section>
  );
}