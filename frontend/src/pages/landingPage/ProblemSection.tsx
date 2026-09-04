import { useLayoutEffect, useRef, useState } from "react";

import sasLogo from "../../assets/logo/sasbio-logo-semfundo.png";

import card1 from "../../assets/problem/card1.jpeg";
import card2 from "../../assets/problem/card2.jpeg";
import card3 from "../../assets/problem/card3.jpeg";

const problemas = [
  {
    numero: "01",
    titulo: "Falta de visibilidade",
    chamada: "Você não consegue prevenir aquilo que não consegue enxergar.",
    texto:
      "Sem dados estruturados, sinais de sofrimento psíquico podem permanecer invisíveis até que o problema já esteja impactando o colaborador e a organização.",
    imagem: card1,
  },

  {
    numero: "02",
    titulo: "Ação tardia",
    chamada: "Quando o sinal aparece tarde, o impacto já começou.",
    texto:
      "Na maioria das empresas, o problema só é percebido quando já virou afastamento, queda de produtividade ou perda de qualidade de vida.",
    imagem: card2,
  },

  {
    numero: "03",
    titulo: "Compliance sem estrutura",
    chamada: "Conformidade exige processo, não apenas documentos.",
    texto:
      "A gestão dos riscos psicossociais precisa fazer parte de um processo estruturado de identificação, acompanhamento e prevenção.",
    imagem: card3,
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Controla a visibilidade da área dos cards enquanto o GSAP
  // (carregado sob demanda) ainda não aplicou o posicionamento
  // inicial — evita um flash dos 3 cards sobrepostos/sem
  // transform antes do JS chegar. Resultado final é idêntico,
  // só não pinta um estado intermediário incorreto.
  const [gsapReady, setGsapReady] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!section || !stage) return;

    const cards = cardsRef.current.filter(
      (card): card is HTMLDivElement => card !== null
    );

    if (!cards.length) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    // gsap + ScrollTrigger só entram no bundle quando esta seção
    // realmente monta (import dinâmico) — não bloqueiam o load
    // inicial da página. O efeito de pin/scroll fica idêntico.
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (cancelled) return;

        const gsap = gsapModule.default;
        const { ScrollTrigger } = scrollTriggerModule;

        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          // ESTADO INICIAL
          cards.forEach((card, index) => {
            gsap.set(card, {
              yPercent: index === 0 ? 0 : 115,
              scale: index === 0 ? 1 : 0.9,
              opacity: 1,
              zIndex: index + 1,
            });
          });

          // TIMELINE DO SCROLL
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: stage,

              // começa quando a área encosta no topo
              start: "top top",

              // velocidade geral da sequência
              end: `+=${window.innerHeight * 2}`,

              // menor = resposta mais rápida
              scrub: 0.4,

              pin: true,
              anticipatePin: 1,

              invalidateOnRefresh: true,
            },
          });

          // EMPILHAMENTO
          for (let index = 1; index < cards.length; index++) {
            const cardAtual = cards[index];
            const cardAnterior = cards[index - 1];

            timeline
              .to(
                cardAnterior,
                {
                  scale: 0.92,
                  yPercent: -4,
                  duration: 1,
                  ease: "none",
                },
                `card-${index}`
              )
              .fromTo(
                cardAtual,
                {
                  yPercent: 115,
                  scale: 0.9,
                },
                {
                  yPercent: 0,
                  scale: 1,
                  duration: 1,
                  ease: "none",
                },
                `card-${index}`
              );
          }
        }, section);

        if (!cancelled) {
          setGsapReady(true);
        }
      }
    );

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        bg-[#f9f8f5]
        font-['Manrope',sans-serif]
      "
    >
      {/* ===================================================== */}
      {/* INTRODUÇÃO                                            */}
      {/* ===================================================== */}

      <div
        className="
          mx-auto
          flex
          min-h-[90svh]
          max-w-7xl
          flex-col
          items-center
          justify-center
          px-6
          pb-24
          pt-32
          text-center
        "
      >
        {/* LOGO */}
        <img
          src={sasLogo}
          alt="Saúde Mental Corporativa"
          loading="lazy"
          className="
            mb-12
            h-24
            w-auto
            object-contain

            sm:h-32
            md:h-40
          "
        />

        {/* TEXTO PEQUENO */}
        <p
          className="
            mb-5
            text-xs
            font-semibold
            uppercase
            tracking-[0.22em]
            text-emerald-700
          "
        >
          Prevenção começa com visibilidade
        </p>

        {/* TÍTULO */}
        <h2
          className="
            max-w-4xl
            font-['Cormorant_Garamond',serif]
            text-5xl
            font-medium
            leading-[0.95]
            tracking-[-0.035em]
            text-slate-950

            sm:text-6xl
            md:text-7xl
          "
        >
          Os riscos psicossociais
          <br />

          <span className="font-normal italic text-slate-500">
            não avisam antes de chegar.
          </span>
        </h2>

        {/* SUBTÍTULO */}
        <p
          className="
            mx-auto
            mt-8
            max-w-2xl
            text-base
            font-normal
            leading-8
            text-slate-500

            sm:text-lg
          "
        >
          Identificar os sinais antes que eles se transformem em
          afastamentos, queda de produtividade e problemas maiores é o
          primeiro passo para uma gestão verdadeiramente preventiva.
        </p>
      </div>

      {/* ===================================================== */}
      {/* ÁREA FIXA DOS CARDS                                  */}
      {/* ===================================================== */}

      <div
        ref={stageRef}
        className="
          relative
          h-[100svh]
          w-full
          overflow-hidden
        "
        style={{ visibility: gsapReady ? "visible" : "hidden" }}
      >
        <div
          className="
            absolute
            inset-0
            mx-auto
            flex
            h-full
            w-full
            max-w-[1500px]
            items-center
            justify-center
            px-5

            sm:px-8
            lg:px-12
          "
        >
          {problemas.map((problema, index) => (
            <div
              key={problema.numero}
              ref={(element) => {
                cardsRef.current[index] = element;
              }}
              className="
                absolute
                left-1/2
                top-1/2
                w-[calc(100%-40px)]
                max-w-[1150px]
                -translate-x-1/2
                -translate-y-1/2
              "
            >
              {/* ================================================= */}
              {/* CARD                                             */}
              {/* ================================================= */}

              <div
                className="
                  relative
                  aspect-[16/9]
                  w-full
                  overflow-hidden
                  rounded-[2.4rem]
                  bg-slate-900
                  shadow-[0_35px_80px_rgba(15,23,42,0.14)]

                  sm:rounded-[3rem]
                  lg:rounded-[3.5rem]
                "
              >
                {/* ================================================= */}
                {/* IMAGEM DE FUNDO                                  */}
                {/* ================================================= */}

                <img
                  src={problema.imagem}
                  alt=""
                  loading="lazy"
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    object-center
                  "
                />

                {/* ================================================= */}
                {/* OVERLAY ESCURO                                   */}
                {/* ================================================= */}

                <div className="absolute inset-0 bg-slate-950/30" />

                {/* ================================================= */}
                {/* GRADIENTE PARA DAR CONTRASTE AO TEXTO             */}
                {/* ================================================= */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-slate-950/95
                    via-slate-950/25
                    to-slate-950/10
                  "
                />

                {/* GRADIENTE LATERAL */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-slate-950/55
                    via-transparent
                    to-transparent
                  "
                />

                {/* ================================================= */}
                {/* NÚMERO                                           */}
                {/* ================================================= */}

                <div
                  className="
                    absolute
                    left-8
                    top-8
                    z-20

                    sm:left-10
                    sm:top-10
                  "
                >
                  <span
                    className="
                      rounded-full
                      border
                      border-white/20
                      bg-black/10
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      tracking-[0.22em]
                      text-white/80
                      backdrop-blur-md
                    "
                  >
                    {problema.numero}
                  </span>
                </div>

                {/* ================================================= */}
                {/* INDICADOR SUPERIOR                               */}
                {/* ================================================= */}

                <div
                  className="
                    absolute
                    right-8
                    top-8
                    z-20
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-black/10
                    backdrop-blur-xl

                    sm:right-10
                    sm:top-10
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_15px_rgba(52,211,153,0.8)]
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* CONTEÚDO                                         */}
                {/* ================================================= */}

                <div
                  className="
                    absolute
                    inset-0
                    z-10
                    flex
                    items-end

                    p-7
                    sm:p-10
                    md:p-14
                    lg:p-16
                  "
                >
                  <div className="max-w-3xl">
                    {/* TÍTULO PEQUENO */}
                    <p
                      className="
                        mb-4
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-emerald-300

                        sm:text-sm
                      "
                    >
                      {problema.titulo}
                    </p>

                    {/* CHAMADA */}
                    <h3
                      className="
                        max-w-3xl
                        font-['Cormorant_Garamond',serif]
                        text-3xl
                        font-medium
                        leading-[0.98]
                        tracking-[-0.035em]
                        text-white

                        sm:text-4xl
                        md:text-5xl
                        lg:text-6xl
                      "
                    >
                      {problema.chamada}
                    </h3>

                    {/* DESCRIÇÃO */}
                    <p
                      className="
                        mt-5
                        max-w-xl
                        text-sm
                        font-normal
                        leading-7
                        text-white/70

                        sm:text-base
                      "
                    >
                      {problema.texto}
                    </p>
                  </div>
                </div>

                {/* ================================================= */}
                {/* LEVE LUZ / VIDRO                                 */}
                {/* ================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-[35%]
                    bg-gradient-to-b
                    from-white/10
                    to-transparent
                  "
                />
              </div>

              {/* ================================================= */}
              {/* PEQUENA CAMADA ATRÁS DO CARD                      */}
              {/* ================================================= */}

              <div
                className={`
                  absolute
                  -bottom-[11px]
                  left-[5%]
                  -z-10
                  h-12
                  w-[90%]
                  rounded-b-[3rem]

                  ${
                    index === 0
                      ? "bg-blue-900"
                      : index === 1
                      ? "bg-emerald-800"
                      : "bg-teal-900"
                  }
                `}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ESPAÇO DE SAÍDA */}
      <div className="h-32 sm:h-44" />
    </section>
  );
}