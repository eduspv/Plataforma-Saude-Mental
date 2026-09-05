import { useState } from "react";
import type { FormEvent } from "react";

import axios from "axios";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { api } from "../../lib/api";

import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

import sasLogo from "../../assets/logo/sasbio-logo-semfundo.png";

// TROQUE PELO NOME REAL DA SUA IMAGEM
import loginBackground from "../../assets/login/login-background.jpeg";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type FormState = {
  email: string;
  senha: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

// ─────────────────────────────────────────────────────────────
// ESTADO INICIAL
// ─────────────────────────────────────────────────────────────

const initialState: FormState = {
  email: "",
  senha: "",
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD POR ROLE
// ─────────────────────────────────────────────────────────────

const roleDashboard: Record<string, string> = {
  SYSTEM_ADMIN: "/admin/dashboard",
  COMPANY_ADMIN: "/empresa/dashboard",
  EMPLOYEE: "/colaborador/dashboard",
};

// ─────────────────────────────────────────────────────────────
// ÍCONES
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

function ShieldIcon() {
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
      <path d="M12 3.5 5 6v5.2c0 4.7 2.9 8.3 7 9.8 4.1-1.5 7-5.1 7-9.8V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────

export default function Login() {
  const [form, setForm] = useState<FormState>(initialState);

  const [errors, setErrors] = useState<FormErrors>({});

  const [loading, setLoading] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const navigate = useNavigate();

  // ───────────────────────────────────────────────────────────
  // REDIRECT SE JÁ ESTIVER LOGADO
  // ───────────────────────────────────────────────────────────

  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("role");

  if (token && role && roleDashboard[role]) {
    return (
      <Navigate
        to={roleDashboard[role]}
        replace
      />
    );
  }

  // ───────────────────────────────────────────────────────────
  // ALTERAÇÃO DOS CAMPOS
  // ───────────────────────────────────────────────────────────

  function handleChange(
    field: keyof FormState,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // remove erro do campo enquanto usuário corrige
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  }

  // ───────────────────────────────────────────────────────────
  // VALIDAÇÃO
  // ───────────────────────────────────────────────────────────

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Informe o e-mail.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Informe um e-mail válido.";
    }

    if (!form.senha) {
      newErrors.senha = "Informe a senha.";
    }

    return newErrors;
  }

  // ───────────────────────────────────────────────────────────
  // SUBMIT
  // ───────────────────────────────────────────────────────────

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitError("");

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/v1/auth/login",
        {
          email: form.email,
          password: form.senha,
        }
      );

      const { data } = response.data;

      // TODO:
      // mover posteriormente para AuthContext
      // e cookies httpOnly

      localStorage.setItem(
        "auth_token",
        data.token
      );

      localStorage.setItem(
        "user_id",
        data.user_id
      );

      localStorage.setItem(
        "role",
        data.role
      );

      localStorage.setItem(
        "user_status",
        data.user_status
      );

      localStorage.setItem(
        "company_status",
        data.company_status
      );

      localStorage.setItem(
        "company_id",
        data.company_id
      );

      // ─────────────────────────────────────────────────────
      // PRÓXIMO PASSO DEFINIDO PELO BACKEND
      // ─────────────────────────────────────────────────────

      switch (data.next_step) {
        case "system_admin_dashboard":
          navigate("/admin/dashboard");
          break;

        case "company_admin_dashboard":
          navigate("/empresa/dashboard");
          break;

        case "plan_selection":
          navigate("/planos");
          break;

        case "home":
          navigate("/colaborador/dashboard");
          break;

        default:
          console.warn(
            "next_step desconhecido:",
            data.next_step
          );

          navigate("/");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const message =
            err.response.data?.message ??
            "E-mail ou senha inválidos.";

          setSubmitError(message);
        } else if (err.request) {
          setSubmitError(
            "Não foi possível conectar ao servidor. Verifique sua conexão."
          );
        } else {
          setSubmitError(
            "Erro inesperado. Tente novamente."
          );
        }
      } else {
        setSubmitError(
          "Erro inesperado. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────

  return (
    <main
      className="
        min-h-[100svh]
        bg-[#f9f8f5]
        font-['Manrope',sans-serif]

        lg:grid
        lg:grid-cols-2
      "
    >
      {/* ===================================================== */}
      {/* LADO ESQUERDO                                        */}
      {/* ===================================================== */}

      <section
        className="
          relative

          min-h-[420px]

          overflow-hidden

          lg:m-4
          lg:min-h-[calc(100svh-2rem)]
          lg:rounded-[40px]
        "
      >
        {/* IMAGEM */}
        <img
          src={loginBackground}
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

        {/* OVERLAY PRINCIPAL */}
        <div
          className="
            absolute
            inset-0

            bg-slate-950/40
          "
        />

        {/* GRADIENTE */}
        <div
          className="
            absolute
            inset-0

            bg-gradient-to-t
            from-slate-950/95
            via-slate-950/35
            to-slate-950/10
          "
        />

        {/* AZUL */}
        <div
          className="
            pointer-events-none

            absolute
            -left-32
            top-[25%]

            h-[400px]
            w-[400px]

            rounded-full

            bg-blue-500/20

            blur-[120px]
          "
        />

        {/* VERDE */}
        <div
          className="
            pointer-events-none

            absolute
            -right-28
            bottom-[-80px]

            h-[400px]
            w-[400px]

            rounded-full

            bg-emerald-500/20

            blur-[120px]
          "
        />

        {/* =================================================== */}
        {/* CONTEÚDO                                            */}
        {/* =================================================== */}

        <div
          className="
            relative
            z-10

            flex
            h-full
            min-h-[420px]

            flex-col
            justify-between

            p-7

            sm:p-10

            lg:min-h-[calc(100svh-2rem)]
            lg:p-12
          "
        >
          {/* LOGO */}
          <Link
            to="/"
            className="
              inline-flex
              w-fit
              items-center
            "
          >
            <img
              src={sasLogo}
              alt="SASBIO"
              className="
                h-16
                w-auto

                brightness-0
                invert

                sm:h-20
              "
            />
          </Link>

          {/* TEXTO */}
          <div
            className="
              max-w-xl

              pb-4

              lg:pb-5
            "
          >
            <div
              className="
                mb-6

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
              <span
                className="
                  h-1.5
                  w-1.5

                  rounded-full

                  bg-emerald-400
                "
              />

              Saúde mental corporativa
            </div>

            <h1
              className="
                font-['Cormorant_Garamond',serif]

                text-[clamp(3.2rem,5vw,6rem)]

                font-medium

                leading-[0.86]

                tracking-[-0.055em]

                text-white
              "
            >
              Bem-vindo
              <br />

              <span
                className="
                  font-normal
                  italic

                  text-white/60
                "
              >
                de volta.
              </span>
            </h1>

            <p
              className="
                mt-7

                max-w-lg

                text-sm
                leading-7

                text-white/60

                sm:text-base
              "
            >
              Acesse sua conta para acompanhar sua equipe,
              visualizar indicadores e continuar construindo um
              ambiente de trabalho mais saudável.
            </p>

            {/* CADASTRO */}
            <div
              className="
                mt-8

                flex
                flex-wrap
                items-center
                gap-4
              "
            >
              <p
                className="
                  text-sm

                  text-white/50
                "
              >
                Ainda não tem uma conta?
              </p>

              <Link
                to="/cadastro"
                className="
                  group

                  inline-flex
                  items-center
                  gap-2

                  text-sm
                  font-semibold

                  text-white

                  transition-colors

                  hover:text-emerald-300
                "
              >
                Cadastre-se

                <span
                  className="
                    transition-transform
                    duration-300

                    group-hover:translate-x-1
                  "
                >
                  <ArrowRight />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* LADO DIREITO                                         */}
      {/* ===================================================== */}

      <section
        className="
          relative

          flex
          min-h-[600px]

          items-center
          justify-center

          overflow-hidden

          px-6
          py-16

          sm:px-10

          lg:min-h-[100svh]
          lg:px-14
          lg:py-12
        "
      >
        {/* FUNDO DECORATIVO */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            inset-0
          "
        >
          <div
            className="
              absolute
              -right-40
              top-[10%]

              h-[400px]
              w-[400px]

              rounded-full

              bg-blue-100/60

              blur-[130px]
            "
          />

          <div
            className="
              absolute
              -left-40
              bottom-[5%]

              h-[400px]
              w-[400px]

              rounded-full

              bg-emerald-100/60

              blur-[130px]
            "
          />
        </div>

        {/* =================================================== */}
        {/* FORMULÁRIO                                          */}
        {/* =================================================== */}

        <div
          className="
            relative
            z-10

            w-full
            max-w-[470px]
          "
        >
          {/* LOGO DESKTOP / FORM */}
          <Link
            to="/"
            className="
              mb-12
              inline-flex
            "
          >
            <img
              src={sasLogo}
              alt="SASBIO"
              className="
                h-16
                w-auto

                object-contain
                object-left
              "
            />
          </Link>

          {/* LABEL */}
          <p
            className="
              text-[10px]
              font-semibold
              uppercase

              tracking-[0.2em]

              text-emerald-700
            "
          >
            Acesso à plataforma
          </p>

          {/* TÍTULO */}
          <h2
            className="
              mt-4

              font-['Cormorant_Garamond',serif]

              text-5xl
              font-medium

              leading-[0.9]

              tracking-[-0.045em]

              text-slate-950

              sm:text-6xl
            "
          >
            Entre na
            <br />

            <span
              className="
                font-normal
                italic

                text-slate-500
              "
            >
              sua conta.
            </span>
          </h2>

          <p
            className="
              mt-6

              max-w-md

              text-sm
              leading-7

              text-slate-500
            "
          >
            Informe seu e-mail e sua senha para continuar.
          </p>

          {/* ================================================= */}
          {/* ERRO                                              */}
          {/* ================================================= */}

          {submitError && (
            <div className="mt-7">
              <ErrorMessage>
                {submitError}
              </ErrorMessage>
            </div>
          )}

          {/* ================================================= */}
          {/* FORM                                              */}
          {/* ================================================= */}

          <form
            className="
              mt-9
              space-y-6
            "
            onSubmit={handleSubmit}
            noValidate
          >
            {/* E-MAIL */}
            <div>
              <Label htmlFor="email">
                E-mail
              </Label>

              <div className="mt-2">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  hasError={!!errors.email}
                  onChange={(e) =>
                    handleChange(
                      "email",
                      e.target.value
                    )
                  }
                />
              </div>

              {errors.email && (
                <p
                  className="
                    mt-2

                    text-xs

                    text-red-600
                  "
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* SENHA */}
            <div>
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <Label htmlFor="senha">
                  Senha
                </Label>

                <Link
                  to="/recuperar-senha"
                  className="
                    text-xs
                    font-semibold

                    text-blue-700

                    transition-colors

                    hover:text-blue-900
                  "
                >
                  Esqueci minha senha
                </Link>
              </div>

              <div className="mt-2">
                <Input
                  id="senha"
                  type="password"
                  value={form.senha}
                  hasError={!!errors.senha}
                  onChange={(e) =>
                    handleChange(
                      "senha",
                      e.target.value
                    )
                  }
                />
              </div>

              {errors.senha && (
                <p
                  className="
                    mt-2

                    text-xs

                    text-red-600
                  "
                >
                  {errors.senha}
                </p>
              )}
            </div>

            {/* BOTÃO */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                className="
                  w-full

                  rounded-[18px]

                  py-4

                  text-sm
                  font-semibold
                "
              >
                Entrar
              </Button>
            </div>
          </form>

          {/* ================================================= */}
          {/* PRIVACIDADE                                      */}
          {/* ================================================= */}

          <div
            className="
              mt-7

              flex
              items-start
              gap-3

              border-t
              border-slate-200

              pt-6
            "
          >
            <span
              className="
                mt-0.5

                text-emerald-700
              "
            >
              <ShieldIcon />
            </span>

            <p
              className="
                max-w-sm

                text-[11px]
                leading-5

                text-slate-400
              "
            >
              Seus dados são protegidos e tratados de acordo com
              as políticas de segurança e privacidade da plataforma.
            </p>
          </div>

          {/* ================================================= */}
          {/* CADASTRO MOBILE / FORM                           */}
          {/* ================================================= */}

          <p
            className="
              mt-8

              text-center
              text-sm

              text-slate-500

              lg:hidden
            "
          >
            Ainda não tem uma conta?{" "}

            <Link
              to="/cadastro"
              className="
                font-semibold

                text-blue-700

                transition-colors

                hover:text-blue-900
              "
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}