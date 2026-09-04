import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeroBackground from "../../assets/hero/Médico_e_paciente_em_terapia_202609011812.jpeg";

const SIGNUP_ROUTE = "/cadastro";

const FRASES = [
  "Triagem inicial em poucos minutos",
  "Indicadores agregados e anônimos",
  "Sinais de risco identificados a tempo",
  "Respostas individuais sempre privadas",
  "Conformidade com a NR-1 em dia",
];

export default function HeroSection() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [i, setI] = useState(0);
  const [borderRadius, setBorderRadius] = useState(0);

  // Troca das frases
  useEffect(() => {
    const id = setInterval(() => {
      setI((p) => (p + 1) % FRASES.length);
    }, 2800);

    return () => clearInterval(id);
  }, []);

  // Arredondamento progressivo conforme o scroll
  // (throttled via rAF — no máximo 1 atualização por frame,
  // em vez de uma a cada evento nativo de scroll)
  useEffect(() => {
    let frameId: number | null = null;

    function updateRadius() {
      const scroll = window.scrollY;

      const radius = Math.min(scroll * 0.22, 70);

      setBorderRadius(radius);
      frameId = null;
    }

    function handleScroll() {
      if (frameId === null) {
        frameId = requestAnimationFrame(updateRadius);
      }
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    updateRadius();

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valor = email.trim();

    navigate(
      valor
        ? `${SIGNUP_ROUTE}?email=${encodeURIComponent(valor)}`
        : SIGNUP_ROUTE
    );
  }

  return (
    <div className="bg-white">
      <section
        className="
          relative
          isolate
          min-h-[100svh]
          overflow-hidden
          bg-slate-950
          font-['Manrope',sans-serif]
        "
        style={{
          borderBottomLeftRadius: `${borderRadius}px`,
          borderBottomRightRadius: `${borderRadius}px`,
        }}
      >
        {/* BACKGROUND */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
        >
          {/* IMAGEM */}
          <img
            src={HeroBackground}
            alt=""
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
            "
          />

          {/* OVERLAY ESCURO */}
          <div className="absolute inset-0 bg-slate-950/45" />

          {/* GRADIENTE */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-slate-950/75
              via-slate-950/25
              to-slate-950/30
            "
          />
        </div>

        {/* CONTEÚDO */}
        <div
          className="
            mx-auto
            flex
            min-h-[100svh]
            max-w-5xl
            flex-col
            items-center
            justify-center
            px-6
            py-24
            text-center
          "
        >
          {/* TEXTO ROTATIVO */}
          <div
            className="
              mb-8
              inline-flex
              items-center
              rounded-full
              border
              border-white/15
              bg-white/10
              px-4
              py-2
              text-sm
              font-medium
              text-emerald-100
              backdrop-blur-md
            "
          >
            <span key={i}>
              {FRASES[i]}
            </span>
          </div>

          {/* TÍTULO */}
          <h1
            className="
              max-w-4xl
              font-['Cormorant_Garamond',serif]
              text-5xl
              font-medium
              leading-[0.95]
              tracking-[-0.03em]
              text-white

              sm:text-7xl
              md:text-8xl
            "
          >
            Sua equipe é gente.
            <br />

            <span className="font-normal italic text-white/95">
              Não número.
            </span>
          </h1>

          {/* SUBTÍTULO */}
          <p
            className="
              mt-8
              max-w-xl
              text-lg
              font-medium
              leading-8
              text-white/85
            "
          >
            Triagem inicial de saúde mental com privacidade real,
            indicadores agregados e conformidade com a NR-1.
          </p>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="
              mt-14
              flex
              w-full
              max-w-md
              items-center
              gap-2
              rounded-[24px]
              border
              border-white/20
              bg-white/20
              p-2
              backdrop-blur-md
            "
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              aria-label="Seu e-mail"
              className="
                w-full
                bg-transparent
                px-5
                py-4
                text-base
                text-white
                placeholder:text-white/65
                focus:outline-none
              "
            />

            <button
              type="submit"
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                rounded-[18px]
                bg-gradient-to-r
                from-emerald-500
                to-blue-600
                px-6
                py-4
                text-base
                font-semibold
                text-white
                transition-all
                duration-300

                hover:scale-[1.02]
                hover:shadow-lg
                hover:shadow-emerald-900/20
              "
            >
              Começar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}