import { Link } from "react-router-dom";

import sasLogo from "../../assets/logo/sasbio-logo-semfundo.png";

export default function FooterSection() {
  return (
    <footer
      className="
        border-t
        border-slate-100
        bg-white
        font-['Manrope',sans-serif]
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          pb-8
          pt-14
          sm:pt-16
        "
      >
        {/* PARTE SUPERIOR */}
        <div
          className="
            grid
            gap-12
            lg:grid-cols-[1.4fr_0.6fr_0.6fr]
          "
        >
          {/* MARCA */}
          <div>
            <img
              src={sasLogo}
              alt="SASBIO"
              loading="lazy"
              className="
                h-16
                w-auto
                object-contain
              "
            />

            <p
              className="
                mt-6
                max-w-md
                text-sm
                leading-7
                text-slate-500
              "
            >
              Tecnologia para apoiar empresas na prevenção dos riscos
              psicossociais e na construção de ambientes de trabalho mais
              saudáveis.
            </p>
          </div>

          {/* PLATAFORMA */}
          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Plataforma
            </p>

            <nav
              className="
                mt-5
                flex
                flex-col
                items-start
                gap-3
              "
            >
              <Link
                to="/planos"
                className="
                  text-sm
                  text-slate-600
                  transition-colors
                  hover:text-slate-950
                "
              >
                Planos
              </Link>

              <Link
                to="/cadastro"
                className="
                  text-sm
                  text-slate-600
                  transition-colors
                  hover:text-slate-950
                "
              >
                Criar conta
              </Link>

              <Link
                to="/login"
                className="
                  text-sm
                  text-slate-600
                  transition-colors
                  hover:text-slate-950
                "
              >
                Entrar
              </Link>
            </nav>
          </div>

          {/* LEGAL */}
          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Legal
            </p>

            <nav
              className="
                mt-5
                flex
                flex-col
                items-start
                gap-3
              "
            >
              <Link
                to="/termos"
                className="
                  text-sm
                  text-slate-600
                  transition-colors
                  hover:text-slate-950
                "
              >
                Termos de uso
              </Link>

              <Link
                to="/privacidade"
                className="
                  text-sm
                  text-slate-600
                  transition-colors
                  hover:text-slate-950
                "
              >
                Privacidade
              </Link>
            </nav>
          </div>
        </div>

        {/* DIVISOR */}
        <div
          className="
            my-10
            h-px
            w-full
            bg-gradient-to-r
            from-transparent
            via-slate-200
            to-transparent
          "
        />

        {/* PARTE INFERIOR */}
        <div
          className="
            flex
            flex-col
            gap-5
            text-xs
            text-slate-400
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p>
              © {new Date().getFullYear()} SASBIO. Todos os direitos reservados.
            </p>

            <p className="mt-2 text-[11px] text-slate-300">
              Saúde Mental Corporativa
            </p>
          </div>

          <p
            className="
              max-w-2xl
              leading-5
              sm:text-right
            "
          >
            Os resultados apresentados pela plataforma constituem uma triagem
            inicial e não substituem avaliação médica, psicológica ou
            psiquiátrica realizada por profissional habilitado.
          </p>
        </div>
      </div>
    </footer>
  );
}