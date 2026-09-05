import { useState } from "react";
import type { FormEvent } from "react";

import axios from "axios";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { api } from "../../lib/api";

import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

import sasLogo from "../../assets/logo/sasbio-logo-semfundo.png";

import cadastroBackground from "../../assets/cadastro/Mulher_sorri_digitando_no_notebook_202609011942.jpeg";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type FormState = {
  nomeEmpresa: string;
  cnpj: string;
  emailCorporativo: string;
  telefone: string;

  nomeResponsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;

  senha: string;
  confirmarSenha: string;

  aceitaTermos: boolean;
  aceitaPrivacidade: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

// ─────────────────────────────────────────────────────────────
// ESTADO INICIAL
// ─────────────────────────────────────────────────────────────

const initialState: FormState = {
  nomeEmpresa: "",
  cnpj: "",
  emailCorporativo: "",
  telefone: "",

  nomeResponsavel: "",
  emailResponsavel: "",
  telefoneResponsavel: "",

  senha: "",
  confirmarSenha: "",

  aceitaTermos: false,
  aceitaPrivacidade: false,
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
// CADASTRO
// ─────────────────────────────────────────────────────────────

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(initialState);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [loading, setLoading] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  // ───────────────────────────────────────────────────────────
  // ALTERAÇÃO DOS CAMPOS
  // ───────────────────────────────────────────────────────────

  function handleChange(
    field: keyof FormState,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

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

    // EMPRESA

    if (!form.nomeEmpresa.trim()) {
      newErrors.nomeEmpresa =
        "Informe o nome da empresa.";
    }

    if (!form.cnpj.trim()) {
      newErrors.cnpj =
        "Informe o CNPJ.";
    }

    if (!form.emailCorporativo.trim()) {
      newErrors.emailCorporativo =
        "Informe o e-mail corporativo.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        form.emailCorporativo
      )
    ) {
      newErrors.emailCorporativo =
        "Informe um e-mail válido.";
    }

    if (!form.telefone.trim()) {
      newErrors.telefone =
        "Informe o telefone.";
    }

    // RESPONSÁVEL

    if (!form.nomeResponsavel.trim()) {
      newErrors.nomeResponsavel =
        "Informe o nome do responsável.";
    }

    if (!form.emailResponsavel.trim()) {
      newErrors.emailResponsavel =
        "Informe o e-mail do responsável.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        form.emailResponsavel
      )
    ) {
      newErrors.emailResponsavel =
        "Informe um e-mail válido.";
    }

    if (!form.telefoneResponsavel.trim()) {
      newErrors.telefoneResponsavel =
        "Informe o telefone do responsável.";
    }

    // SENHA

    if (!form.senha) {
      newErrors.senha =
        "Informe a senha.";
    } else if (form.senha.length < 8) {
      newErrors.senha =
        "A senha deve ter no mínimo 8 caracteres.";
    }

    if (!form.confirmarSenha) {
      newErrors.confirmarSenha =
        "Confirme a senha.";
    } else if (
      form.confirmarSenha !== form.senha
    ) {
      newErrors.confirmarSenha =
        "As senhas não coincidem.";
    }

    // TERMOS

    if (!form.aceitaTermos) {
      newErrors.aceitaTermos =
        "É necessário aceitar os termos de uso.";
    }

    if (!form.aceitaPrivacidade) {
      newErrors.aceitaPrivacidade =
        "É necessário aceitar a política de privacidade.";
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

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/v1/auth/register-company",
        {
          company_name:
            form.nomeEmpresa,

          cnpj:
            form.cnpj,

          corporate_email:
            form.emailCorporativo,

          company_phone:
            form.telefone,

          responsible_name:
            form.nomeResponsavel,

          responsible_email:
            form.emailResponsavel,

          responsible_phone:
            form.telefoneResponsavel,

          password:
            form.senha,

          accepted_terms:
            form.aceitaTermos,

          accepted_privacy_policy:
            form.aceitaPrivacidade,
        }
      );

      const { data } = response.data;

      // TODO:
      // migrar posteriormente para AuthContext
      // + cookie HttpOnly Secure.

      localStorage.setItem(
        "auth_token",
        data.token
      );

      switch (data.next_step) {
        case "select_plan":
          navigate("/planos");
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
            "Erro ao cadastrar. Tente novamente.";

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
        lg:grid-cols-[0.92fr_1.08fr]
      "
    >
      {/* ===================================================== */}
      {/* LADO ESQUERDO                                        */}
      {/* ===================================================== */}

      <div
        className="
          lg:sticky
          lg:top-0
          lg:h-[100svh]
          lg:p-4
          lg:pr-0
        "
      >
        <section
          className="
            relative
            min-h-[430px]
            overflow-hidden

            lg:h-[calc(100svh-2rem)]
            lg:min-h-0
            lg:rounded-[40px]
          "
        >
          {/* IMAGEM */}

          <img
            src={cadastroBackground}
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

          {/* OVERLAY */}

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
              top-[20%]

              h-[440px]
              w-[440px]

              rounded-full

              bg-blue-500/20
              blur-[130px]
            "
          />

          {/* VERDE */}

          <div
            className="
              pointer-events-none
              absolute

              -right-32
              bottom-[-100px]

              h-[460px]
              w-[460px]

              rounded-full

              bg-emerald-500/20
              blur-[130px]
            "
          />

          {/* CÍRCULOS DECORATIVOS */}

          <div
            className="
              pointer-events-none
              absolute

              right-[8%]
              top-[18%]

              h-44
              w-44

              rounded-full

              border
              border-white/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute

              right-[13%]
              top-[23%]

              h-28
              w-28

              rounded-full

              border
              border-emerald-300/15
            "
          />

          {/* CONTEÚDO */}

          <div
            className="
              relative
              z-10

              flex
              h-full
              min-h-[430px]

              flex-col
              justify-between

              p-7

              sm:p-10

              lg:min-h-0
              lg:p-12
            "
          >
            {/* LOGO */}

            <Link
              to="/"
              className="
                inline-flex
                w-fit
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
                pb-3
              "
            >
              {/* LABEL */}

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

                Comece agora
              </div>

              {/* TÍTULO */}

              <h1
                className="
                  font-['Cormorant_Garamond',serif]

                  text-[clamp(3.4rem,5vw,6rem)]

                  font-medium

                  leading-[0.85]

                  tracking-[-0.055em]

                  text-white
                "
              >
                Cuidar começa
                <br />

                <span
                  className="
                    font-normal
                    italic
                    text-white/60
                  "
                >
                  por aqui.
                </span>
              </h1>

              {/* TEXTO */}

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
                Cadastre sua empresa e dê o
                primeiro passo para estruturar
                uma gestão mais preventiva,
                humana e orientada por dados.
              </p>

              {/* JÁ TEM CONTA */}

              <div
                className="
                  mt-8

                  flex
                  flex-wrap
                  items-center
                  gap-4
                "
              >
                <p className="text-sm text-white/50">
                  Já possui uma conta?
                </p>

                <Link
                  to="/login"
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
                  Fazer login

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
      </div>

      {/* ===================================================== */}
      {/* LADO DIREITO                                         */}
      {/* ===================================================== */}

      <section
        className="
          relative
          min-h-[100svh]
          overflow-hidden

          px-6
          py-14

          sm:px-10
          sm:py-16

          lg:px-14
          lg:py-16

          xl:px-20
        "
      >
        {/* FUNDO */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute

              -right-44
              top-[8%]

              h-[440px]
              w-[440px]

              rounded-full

              bg-blue-100/60
              blur-[140px]
            "
          />

          <div
            className="
              absolute

              -left-32
              bottom-[12%]

              h-[440px]
              w-[440px]

              rounded-full

              bg-emerald-100/60
              blur-[140px]
            "
          />
        </div>

        {/* CONTAINER FORM */}

        <div
          className="
            relative
            z-10

            mx-auto

            w-full
            max-w-[720px]
          "
        >
          {/* LOGO */}

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
            Cadastro da empresa
          </p>

          {/* TÍTULO PRINCIPAL */}

          <h2
            className="
              mt-4

              font-['Cormorant_Garamond',serif]

              text-5xl
              font-medium

              leading-[0.88]

              tracking-[-0.05em]

              text-slate-950

              sm:text-6xl
              xl:text-7xl
            "
          >
            Crie a estrutura
            <br />

            <span
              className="
                font-normal
                italic
                text-slate-500
              "
            >
              da sua empresa.
            </span>
          </h2>

          <p
            className="
              mt-6
              max-w-xl

              text-sm
              leading-7

              text-slate-500

              sm:text-base
            "
          >
            Informe os dados da empresa e do
            responsável pela conta para iniciar
            sua jornada na plataforma.
          </p>

          {/* ERRO GERAL */}

          {submitError && (
            <div className="mt-8">
              <ErrorMessage>
                {submitError}
              </ErrorMessage>
            </div>
          )}

          {/* ================================================= */}
          {/* FORMULÁRIO                                       */}
          {/* ================================================= */}

          <form
            className="mt-12"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* ================================================= */}
            {/* DADOS DA EMPRESA                                 */}
            {/* ================================================= */}

            <div>
              {/* NOVO TÍTULO */}

              <div className="mb-8">
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase

                    tracking-[0.2em]

                    text-blue-600
                  "
                >
                  Empresa
                </p>

                <h3
                  className="
                    mt-2

                    text-[24px]
                    font-light

                    leading-tight

                    tracking-[-0.035em]

                    text-slate-900
                  "
                >
                  Dados da empresa
                </h3>

                <p
                  className="
                    mt-1.5

                    text-[13px]
                    font-light

                    text-slate-400
                  "
                >
                  Informações institucionais
                </p>
              </div>

              {/* CAMPOS */}

              <div
                className="
                  grid
                  gap-x-8
                  gap-y-7

                  sm:grid-cols-2
                "
              >
                {/* NOME DA EMPRESA */}

                <div className="sm:col-span-2">
                  <Label htmlFor="nomeEmpresa">
                    Nome da empresa
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="nomeEmpresa"
                      value={form.nomeEmpresa}
                      hasError={
                        !!errors.nomeEmpresa
                      }
                      onChange={(e) =>
                        handleChange(
                          "nomeEmpresa",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.nomeEmpresa && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.nomeEmpresa}
                    </p>
                  )}
                </div>

                {/* CNPJ */}

                <div>
                  <Label htmlFor="cnpj">
                    CNPJ
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="cnpj"
                      value={form.cnpj}
                      hasError={!!errors.cnpj}
                      onChange={(e) =>
                        handleChange(
                          "cnpj",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.cnpj && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.cnpj}
                    </p>
                  )}
                </div>

                {/* TELEFONE */}

                <div>
                  <Label htmlFor="telefone">
                    Telefone
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="telefone"
                      type="tel"
                      value={form.telefone}
                      hasError={
                        !!errors.telefone
                      }
                      onChange={(e) =>
                        handleChange(
                          "telefone",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.telefone && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.telefone}
                    </p>
                  )}
                </div>

                {/* EMAIL CORPORATIVO */}

                <div className="sm:col-span-2">
                  <Label htmlFor="emailCorporativo">
                    E-mail corporativo
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="emailCorporativo"
                      type="email"
                      value={
                        form.emailCorporativo
                      }
                      hasError={
                        !!errors.emailCorporativo
                      }
                      onChange={(e) =>
                        handleChange(
                          "emailCorporativo",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.emailCorporativo && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        errors.emailCorporativo
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* DIVISOR */}

            <div
              className="
                my-12

                h-px
                w-full

                bg-gradient-to-r

                from-transparent
                via-slate-200
                to-transparent
              "
            />

            {/* ================================================= */}
            {/* RESPONSÁVEL                                      */}
            {/* ================================================= */}

            <div>
              {/* NOVO TÍTULO */}

              <div className="mb-8">
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase

                    tracking-[0.2em]

                    text-emerald-600
                  "
                >
                  Responsável
                </p>

                <h3
                  className="
                    mt-2

                    text-[24px]
                    font-light

                    leading-tight

                    tracking-[-0.035em]

                    text-slate-900
                  "
                >
                  Responsável pela conta
                </h3>

                <p
                  className="
                    mt-1.5

                    text-[13px]
                    font-light

                    text-slate-400
                  "
                >
                  Pessoa responsável pela gestão
                </p>
              </div>

              {/* CAMPOS */}

              <div
                className="
                  grid
                  gap-x-8
                  gap-y-7

                  sm:grid-cols-2
                "
              >
                {/* NOME RESPONSÁVEL */}

                <div className="sm:col-span-2">
                  <Label htmlFor="nomeResponsavel">
                    Nome do responsável
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="nomeResponsavel"
                      value={
                        form.nomeResponsavel
                      }
                      hasError={
                        !!errors.nomeResponsavel
                      }
                      onChange={(e) =>
                        handleChange(
                          "nomeResponsavel",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.nomeResponsavel && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        errors.nomeResponsavel
                      }
                    </p>
                  )}
                </div>

                {/* EMAIL */}

                <div>
                  <Label htmlFor="emailResponsavel">
                    E-mail do responsável
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="emailResponsavel"
                      type="email"
                      value={
                        form.emailResponsavel
                      }
                      hasError={
                        !!errors.emailResponsavel
                      }
                      onChange={(e) =>
                        handleChange(
                          "emailResponsavel",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.emailResponsavel && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        errors.emailResponsavel
                      }
                    </p>
                  )}
                </div>

                {/* TELEFONE */}

                <div>
                  <Label htmlFor="telefoneResponsavel">
                    Telefone do responsável
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="telefoneResponsavel"
                      type="tel"
                      value={
                        form.telefoneResponsavel
                      }
                      hasError={
                        !!errors.telefoneResponsavel
                      }
                      onChange={(e) =>
                        handleChange(
                          "telefoneResponsavel",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.telefoneResponsavel && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        errors.telefoneResponsavel
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* DIVISOR */}

            <div
              className="
                my-12

                h-px
                w-full

                bg-gradient-to-r

                from-transparent
                via-slate-200
                to-transparent
              "
            />

            {/* ================================================= */}
            {/* ACESSO                                           */}
            {/* ================================================= */}

            <div>
              {/* NOVO TÍTULO */}

              <div className="mb-8">
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase

                    tracking-[0.2em]

                    text-blue-600
                  "
                >
                  Acesso
                </p>

                <h3
                  className="
                    mt-2

                    text-[24px]
                    font-light

                    leading-tight

                    tracking-[-0.035em]

                    text-slate-900
                  "
                >
                  Crie seu acesso
                </h3>

                <p
                  className="
                    mt-1.5

                    text-[13px]
                    font-light

                    text-slate-400
                  "
                >
                  Defina sua senha de acesso
                </p>
              </div>

              {/* CAMPOS */}

              <div
                className="
                  grid
                  gap-x-8
                  gap-y-7

                  sm:grid-cols-2
                "
              >
                {/* SENHA */}

                <div>
                  <Label htmlFor="senha">
                    Senha
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="senha"
                      type="password"
                      value={form.senha}
                      hasError={
                        !!errors.senha
                      }
                      onChange={(e) =>
                        handleChange(
                          "senha",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.senha && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.senha}
                    </p>
                  )}
                </div>

                {/* CONFIRMAR SENHA */}

                <div>
                  <Label htmlFor="confirmarSenha">
                    Confirmar senha
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={
                        form.confirmarSenha
                      }
                      hasError={
                        !!errors.confirmarSenha
                      }
                      onChange={(e) =>
                        handleChange(
                          "confirmarSenha",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {errors.confirmarSenha && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        errors.confirmarSenha
                      }
                    </p>
                  )}
                </div>
              </div>

              <p
                className="
                  mt-4

                  text-[11px]
                  font-light
                  leading-5

                  text-slate-400
                "
              >
                Sua senha deve conter no mínimo
                8 caracteres.
              </p>
            </div>

            {/* DIVISOR */}

            <div
              className="
                my-12

                h-px
                w-full

                bg-gradient-to-r

                from-transparent
                via-slate-200
                to-transparent
              "
            />

            {/* ================================================= */}
            {/* TERMOS                                           */}
            {/* ================================================= */}

            <div
              className="
                space-y-4

                rounded-[26px]

                bg-white/40

                p-5

                backdrop-blur-xl
              "
            >
              {/* TERMOS */}

              <div>
                <label
                  className="
                    flex
                    cursor-pointer
                    items-start
                    gap-3

                    text-sm
                    font-light
                    leading-6

                    text-slate-600
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      form.aceitaTermos
                    }
                    onChange={(e) =>
                      handleChange(
                        "aceitaTermos",
                        e.target.checked
                      )
                    }
                    className="
                      mt-1

                      h-4
                      w-4

                      shrink-0

                      rounded

                      border-slate-300

                      accent-emerald-600
                    "
                  />

                  <span>
                    Li e aceito os{" "}

                    <Link
                      to="/termos"
                      target="_blank"
                      className="
                        font-medium
                        text-blue-700

                        transition-colors

                        hover:text-blue-900
                      "
                    >
                      termos de uso
                    </Link>
                    .
                  </span>
                </label>

                {errors.aceitaTermos && (
                  <p className="ml-7 mt-1.5 text-xs text-red-600">
                    {errors.aceitaTermos}
                  </p>
                )}
              </div>

              {/* PRIVACIDADE */}

              <div>
                <label
                  className="
                    flex
                    cursor-pointer
                    items-start
                    gap-3

                    text-sm
                    font-light
                    leading-6

                    text-slate-600
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      form.aceitaPrivacidade
                    }
                    onChange={(e) =>
                      handleChange(
                        "aceitaPrivacidade",
                        e.target.checked
                      )
                    }
                    className="
                      mt-1

                      h-4
                      w-4

                      shrink-0

                      rounded

                      border-slate-300

                      accent-emerald-600
                    "
                  />

                  <span>
                    Li e aceito a{" "}

                    <Link
                      to="/privacidade"
                      target="_blank"
                      className="
                        font-medium
                        text-blue-700

                        transition-colors

                        hover:text-blue-900
                      "
                    >
                      política de privacidade
                    </Link>
                    .
                  </span>
                </label>

                {errors.aceitaPrivacidade && (
                  <p className="ml-7 mt-1.5 text-xs text-red-600">
                    {
                      errors.aceitaPrivacidade
                    }
                  </p>
                )}
              </div>
            </div>

            {/* ================================================= */}
            {/* BOTÃO                                            */}
            {/* ================================================= */}

            <div className="mt-8">
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
                Criar minha conta
              </Button>
            </div>
          </form>

          {/* ================================================= */}
          {/* SEGURANÇA                                        */}
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
                shrink-0
                text-emerald-700
              "
            >
              <ShieldIcon />
            </span>

            <p
              className="
                max-w-xl

                text-[11px]
                font-light
                leading-5

                text-slate-400
              "
            >
              Seus dados são protegidos e tratados
              de acordo com as políticas de
              segurança e privacidade da
              plataforma.
            </p>
          </div>

          {/* ================================================= */}
          {/* LOGIN MOBILE                                     */}
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
            Já possui uma conta?{" "}

            <Link
              to="/login"
              className="
                font-semibold

                text-blue-700

                transition-colors

                hover:text-blue-900
              "
            >
              Fazer login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}