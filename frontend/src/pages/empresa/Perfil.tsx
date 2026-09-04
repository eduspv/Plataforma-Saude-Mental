import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { api } from "../../lib/api";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type FormState = {
  nome: string;
  email: string;
  novaSenha: string;
  confirmarNovaSenha: string;
};

type FormErrors = Partial<
  Record<keyof FormState, string>
>;

type ProfileApiResponse = {
  data: {
    name: string;
    email: string;
  };
  success: boolean;
};

// ─────────────────────────────────────────────────────────────
// ESTADO INICIAL
// ─────────────────────────────────────────────────────────────

const initialState: FormState = {
  nome: "",
  email: "",
  novaSenha: "",
  confirmarNovaSenha: "",
};

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
      />

      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="3"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
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

function EyeIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[18px] w-[18px]"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6 0 9.5 6 9.5 6a15.8 15.8 0 0 1-3 3.7" />
          <path d="M6.6 6.6C4 8.4 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5" />
        </>
      )}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────────────────────

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        rounded-[30px]
        border
        border-slate-200/80
        bg-white
        shadow-[0_15px_50px_rgba(15,23,42,0.045)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function ProfileInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4

        rounded-[20px]

        border
        border-slate-100

        bg-slate-50/60

        p-4
      "
    >
      <span
        className="
          flex
          h-10
          w-10
          shrink-0

          items-center
          justify-center

          rounded-[13px]

          bg-white

          text-blue-600

          shadow-[0_6px_20px_rgba(15,23,42,0.04)]
        "
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p
          className="
            text-[9px]
            font-medium
            uppercase

            tracking-[0.15em]

            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            truncate

            text-sm
            font-light

            text-slate-800
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PERFIL
// ─────────────────────────────────────────────────────────────

export default function Perfil() {
  const [form, setForm] =
    useState<FormState>(initialState);

  const [savedForm, setSavedForm] =
    useState<FormState>(initialState);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [submitError, setSubmitError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // ───────────────────────────────────────────────────────────
  // CARREGAR PERFIL
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError("");

      try {
        const response =
          await api.get<ProfileApiResponse>(
            "/api/v1/users/me"
          );

        if (cancelled) {
          return;
        }

        const profile = response.data?.data;

        if (!profile) {
          throw new Error(
            "Resposta inválida ao carregar perfil."
          );
        }

        const loadedForm: FormState = {
          nome: profile.name ?? "",
          email: profile.email ?? "",
          novaSenha: "",
          confirmarNovaSenha: "",
        };

        setForm(loadedForm);
        setSavedForm(loadedForm);
        setErrors({});
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );

        if (!cancelled) {
          setProfileError(
            "Não foi possível carregar os dados do perfil."
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // ───────────────────────────────────────────────────────────
  // ALTERAÇÕES
  // ───────────────────────────────────────────────────────────

  const hasChanges = useMemo(() => {
    return (
      form.nome !== savedForm.nome ||
      form.email !== savedForm.email ||
      form.novaSenha.length > 0 ||
      form.confirmarNovaSenha.length > 0
    );
  }, [form, savedForm]);

  // ───────────────────────────────────────────────────────────
  // INICIAIS
  // ───────────────────────────────────────────────────────────

  const initials = useMemo(() => {
    const name = form.nome.trim();

    if (!name) {
      return "US";
    }

    const parts = name
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  }, [form.nome]);

  // ───────────────────────────────────────────────────────────
  // FORÇA DA SENHA
  // ───────────────────────────────────────────────────────────

  const passwordStrength =
    useMemo(() => {
      const password =
        form.novaSenha;

      if (!password) {
        return 0;
      }

      let strength = 0;

      if (password.length >= 8) {
        strength++;
      }

      if (/[A-Z]/.test(password)) {
        strength++;
      }

      if (/[0-9]/.test(password)) {
        strength++;
      }

      if (
        /[^A-Za-z0-9]/.test(password)
      ) {
        strength++;
      }

      return strength;
    }, [form.novaSenha]);

  const passwordStrengthLabel =
    useMemo(() => {
      if (!form.novaSenha) {
        return "";
      }

      if (passwordStrength <= 1) {
        return "Fraca";
      }

      if (passwordStrength === 2) {
        return "Razoável";
      }

      if (passwordStrength === 3) {
        return "Boa";
      }

      return "Forte";
    }, [
      form.novaSenha,
      passwordStrength,
    ]);

  // ───────────────────────────────────────────────────────────
  // ALTERAR CAMPO
  // ───────────────────────────────────────────────────────────

  function handleChange(
    field: keyof FormState,
    value: string
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

    if (!form.nome.trim()) {
      newErrors.nome =
        "Informe seu nome.";
    }

    if (!form.email.trim()) {
      newErrors.email =
        "Informe seu e-mail.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        form.email
      )
    ) {
      newErrors.email =
        "Informe um e-mail válido.";
    }

    if (
      form.novaSenha &&
      form.novaSenha.length < 8
    ) {
      newErrors.novaSenha =
        "A senha deve ter no mínimo 8 caracteres.";
    }

    if (
      form.novaSenha &&
      !form.confirmarNovaSenha
    ) {
      newErrors.confirmarNovaSenha =
        "Confirme a nova senha.";
    }

    if (
      form.novaSenha &&
      form.confirmarNovaSenha !==
        form.novaSenha
    ) {
      newErrors.confirmarNovaSenha =
        "As senhas não coincidem.";
    }

    if (
      form.confirmarNovaSenha &&
      !form.novaSenha
    ) {
      newErrors.novaSenha =
        "Informe a nova senha.";
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

    const validationErrors =
      validate();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length >
      0
    ) {
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Atualizar perfil:",
        form
      );

      /*
       * TODO:
       *
       * GET /api/v1/users/me
       * para carregar nome e e-mail.
       *
       * PUT /api/v1/users/me
       * para atualizar o perfil.
       *
       * Exemplo de payload:
       *
       * {
       *   name: form.nome,
       *   email: form.email,
       *   password:
       *     form.novaSenha || undefined
       * }
       */

      /*
       * Quando o PUT estiver funcionando:
       *
       * setSavedForm({
       *   nome: form.nome,
       *   email: form.email,
       *   novaSenha: "",
       *   confirmarNovaSenha: "",
       * });
       *
       * setForm((prev) => ({
       *   ...prev,
       *   novaSenha: "",
       *   confirmarNovaSenha: "",
       * }));
       */

    } catch {
      setSubmitError(
        "Não foi possível salvar as alterações do perfil."
      );
    } finally {
      setLoading(false);
    }
  }

  // ───────────────────────────────────────────────────────────
  // DESCARTAR
  // ───────────────────────────────────────────────────────────

  function handleDiscard() {
    setForm({
      nome: savedForm.nome,
      email: savedForm.email,
      novaSenha: "",
      confirmarNovaSenha: "",
    });

    setErrors({});
    setSubmitError("");
  }

  return (
    <div
      className="
        min-h-full
        font-['Manrope',sans-serif]
      "
    >
      <div className="mx-auto max-w-[1500px]">
        {/* =================================================== */}
        {/* CABEÇALHO                                           */}
        {/* =================================================== */}

        <header>
          <p
            className="
              text-[10px]
              font-medium
              uppercase

              tracking-[0.2em]

              text-emerald-700
            "
          >
            Conta pessoal
          </p>

          <h1
            className="
              mt-3

              text-4xl
              font-light

              tracking-[-0.05em]

              text-slate-950

              sm:text-5xl
            "
          >
            Meu perfil
          </h1>

          <p
            className="
              mt-3

              max-w-2xl

              text-sm
              font-light
              leading-7

              text-slate-500
            "
          >
            Gerencie seus dados pessoais,
            informações de acesso e segurança da
            sua conta.
          </p>
        </header>

        {profileError && (
          <div className="mt-6">
            <ErrorMessage>
              {profileError}
            </ErrorMessage>

            <button
              type="button"
              onClick={() =>
                setReloadKey((prev) => prev + 1)
              }
              className="
                mt-3
                inline-flex
                h-[42px]
                items-center
                justify-center
                rounded-[13px]
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-medium
                text-slate-700
                transition-colors
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* =================================================== */}
        {/* PERFIL PRINCIPAL                                    */}
        {/* =================================================== */}

        <div
          className="
            mt-10

            grid
            gap-6

            xl:grid-cols-[1.25fr_0.75fr]
          "
        >
          {/* ================================================= */}
          {/* CARD DO USUÁRIO                                   */}
          {/* ================================================= */}

          <div
            className="
              group
              relative

              overflow-hidden

              rounded-[32px]

              bg-slate-950

              p-7

              text-white

              shadow-[0_20px_60px_rgba(15,23,42,0.14)]

              sm:p-8
            "
          >
            {/* GLOW AZUL */}

            <div
              className="
                pointer-events-none

                absolute
                -right-24
                -top-24

                h-80
                w-80

                rounded-full

                bg-blue-500/20

                blur-[100px]
              "
            />

            {/* GLOW VERDE */}

            <div
              className="
                pointer-events-none

                absolute
                -bottom-32
                left-[15%]

                h-80
                w-80

                rounded-full

                bg-emerald-500/20

                blur-[100px]
              "
            />

            {/* DECORAÇÃO */}

            <div
              className="
                pointer-events-none

                absolute
                right-12
                top-10

                h-44
                w-44

                rounded-full

                border
                border-white/[0.06]
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                right-[82px]
                top-[70px]

                h-28
                w-28

                rounded-full

                border
                border-emerald-300/10
              "
            />

            <div className="relative z-10">
              {/* AVATAR */}

              <div
                className="
                  flex
                  flex-col

                  gap-6

                  sm:flex-row
                  sm:items-center
                "
              >
                <div
                  className="
                    flex
                    h-20
                    w-20
                    shrink-0

                    items-center
                    justify-center

                    rounded-[24px]

                    border
                    border-white/10

                    bg-white/[0.08]

                    text-2xl
                    font-light

                    tracking-[-0.04em]

                    text-white

                    backdrop-blur-xl
                  "
                >
                  {initials}
                </div>

                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.2em]

                      text-emerald-300
                    "
                  >
                    Perfil
                  </p>

                  <h2
                    className="
                      mt-2

                      text-4xl
                      font-light

                      tracking-[-0.05em]

                      text-white
                    "
                  >
                    {profileLoading
                      ? "Carregando..."
                      : form.nome || "Seu nome"}
                  </h2>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light

                      text-white/45
                    "
                  >
                    {profileLoading
                      ? "Carregando..."
                      : form.email || "seu@email.com"}
                  </p>
                </div>
              </div>

              {/* INFORMAÇÕES */}

              <div
                className="
                  mt-12

                  grid
                  gap-3

                  sm:grid-cols-2
                "
              >
                <div
                  className="
                    rounded-[18px]

                    border
                    border-white/10

                    bg-white/[0.05]

                    p-4

                    backdrop-blur-xl
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-medium
                      uppercase

                      tracking-[0.14em]

                      text-white/35
                    "
                  >
                    Nome
                  </p>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light

                      text-white/75
                    "
                  >
                    {profileLoading ? "Carregando..." : form.nome || "—"}
                  </p>
                </div>

                <div
                  className="
                    rounded-[18px]

                    border
                    border-white/10

                    bg-white/[0.05]

                    p-4

                    backdrop-blur-xl
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-medium
                      uppercase

                      tracking-[0.14em]

                      text-white/35
                    "
                  >
                    E-mail
                  </p>

                  <p
                    className="
                      mt-2
                      truncate

                      text-sm
                      font-light

                      text-white/75
                    "
                  >
                    {profileLoading ? "Carregando..." : form.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="
                absolute
                bottom-0
                left-0

                h-[2px]
                w-full

                origin-left
                scale-x-0

                bg-gradient-to-r
                from-blue-500
                via-blue-400
                to-emerald-400

                transition-transform
                duration-700

                group-hover:scale-x-100
              "
            />
          </div>

          {/* ================================================= */}
          {/* SEGURANÇA                                        */}
          {/* ================================================= */}

          <Panel className="p-7 sm:p-8">
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase

                    tracking-[0.18em]

                    text-emerald-600
                  "
                >
                  Segurança
                </p>

                <h2
                  className="
                    mt-2

                    text-2xl
                    font-light

                    tracking-[-0.035em]

                    text-slate-950
                  "
                >
                  Proteção da conta
                </h2>
              </div>

              <span
                className="
                  flex
                  h-11
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  rounded-[15px]

                  bg-emerald-50

                  text-emerald-600
                "
              >
                <ShieldIcon />
              </span>
            </div>

            <p
              className="
                mt-5

                text-sm
                font-light
                leading-6

                text-slate-500
              "
            >
              Mantenha seus dados de acesso
              atualizados e utilize uma senha
              exclusiva para a plataforma.
            </p>

            <div
              className="
                mt-7

                space-y-3

                rounded-[20px]

                bg-emerald-50/70

                p-5
              "
            >
              <SecurityItem>
                Use pelo menos 8 caracteres
              </SecurityItem>

              <SecurityItem>
                Combine letras, números e símbolos
              </SecurityItem>

              <SecurityItem>
                Evite reutilizar senhas de outros serviços
              </SecurityItem>
            </div>
          </Panel>
        </div>

        {/* =================================================== */}
        {/* FORMULÁRIO                                         */}
        {/* =================================================== */}

        <form
          className="mt-6"
          onSubmit={handleSubmit}
          noValidate
        >
          {submitError && (
            <div className="mb-6">
              <ErrorMessage>
                {submitError}
              </ErrorMessage>
            </div>
          )}

          <div
            className="
              grid
              gap-6

              xl:grid-cols-2
            "
          >
            {/* =============================================== */}
            {/* DADOS PESSOAIS                                  */}
            {/* =============================================== */}

            <Panel className="p-7 sm:p-8">
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-5
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.18em]

                      text-blue-600
                    "
                  >
                    Perfil
                  </p>

                  <h2
                    className="
                      mt-2

                      text-2xl
                      font-light

                      tracking-[-0.035em]

                      text-slate-950
                    "
                  >
                    Dados pessoais
                  </h2>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light
                      leading-6

                      text-slate-400
                    "
                  >
                    Informações utilizadas para
                    identificar sua conta.
                  </p>
                </div>

                <span
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0

                    items-center
                    justify-center

                    rounded-[15px]

                    bg-blue-50

                    text-blue-600
                  "
                >
                  <UserIcon />
                </span>
              </div>

              <div className="mt-10 space-y-9">
                {/* NOME */}

                <div>
                  <Label htmlFor="nome">
                    Nome
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="nome"
                      value={form.nome}
                      disabled={profileLoading}
                      hasError={
                        !!errors.nome
                      }
                      onChange={(e) =>
                        handleChange(
                          "nome",
                          e.target.value
                        )
                      }
                      autoComplete="name"
                    />
                  </div>

                  {errors.nome && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* EMAIL */}

                <div>
                  <Label htmlFor="email">
                    E-mail
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      disabled={profileLoading}
                      hasError={
                        !!errors.email
                      }
                      onChange={(e) =>
                        handleChange(
                          "email",
                          e.target.value
                        )
                      }
                      autoComplete="email"
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}

                  <p
                    className="
                      mt-3

                      text-[11px]
                      font-light
                      leading-5

                      text-slate-400
                    "
                  >
                    Este é o endereço utilizado
                    para acessar sua conta.
                  </p>
                </div>
              </div>
            </Panel>

            {/* =============================================== */}
            {/* ALTERAR SENHA                                   */}
            {/* =============================================== */}

            <Panel className="p-7 sm:p-8">
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-5
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase

                      tracking-[0.18em]

                      text-emerald-600
                    "
                  >
                    Acesso
                  </p>

                  <h2
                    className="
                      mt-2

                      text-2xl
                      font-light

                      tracking-[-0.035em]

                      text-slate-950
                    "
                  >
                    Alterar senha
                  </h2>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light
                      leading-6

                      text-slate-400
                    "
                  >
                    Deixe os campos vazios caso não
                    queira alterar sua senha.
                  </p>
                </div>

                <span
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0

                    items-center
                    justify-center

                    rounded-[15px]

                    bg-emerald-50

                    text-emerald-600
                  "
                >
                  <LockIcon />
                </span>
              </div>

              <div className="mt-10 space-y-9">
                {/* NOVA SENHA */}

                <div>
                  <Label htmlFor="novaSenha">
                    Nova senha
                  </Label>

                  <div className="relative mt-1">
                    <Input
                      id="novaSenha"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        form.novaSenha
                      }
                      hasError={
                        !!errors.novaSenha
                      }
                      className="pr-11"
                      onChange={(e) =>
                        handleChange(
                          "novaSenha",
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        absolute
                        right-0
                        top-1/2
                        z-20

                        flex
                        h-9
                        w-9

                        -translate-y-1/2

                        cursor-pointer

                        items-center
                        justify-center

                        rounded-[10px]

                        text-slate-400

                        transition-colors

                        hover:bg-slate-50
                        hover:text-slate-700
                      "
                      aria-label={
                        showNewPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      <EyeIcon
                        open={showNewPassword}
                      />
                    </button>
                  </div>

                  {errors.novaSenha && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        errors.novaSenha
                      }
                    </p>
                  )}

                  {/* FORÇA DA SENHA */}

                  {form.novaSenha && (
                    <div className="mt-4">
                      <div
                        className="
                          flex
                          gap-1.5
                        "
                      >
                        {[
                          1,
                          2,
                          3,
                          4,
                        ].map((level) => (
                          <span
                            key={level}
                            className={`
                              h-1
                              flex-1

                              rounded-full

                              transition-colors
                              duration-300

                              ${
                                level <=
                                passwordStrength
                                  ? passwordStrength <=
                                    1
                                    ? "bg-red-400"
                                    : passwordStrength ===
                                        2
                                      ? "bg-amber-400"
                                      : passwordStrength ===
                                          3
                                        ? "bg-blue-500"
                                        : "bg-emerald-500"
                                  : "bg-slate-100"
                              }
                            `}
                          />
                        ))}
                      </div>

                      <div
                        className="
                          mt-2

                          flex
                          justify-between

                          text-[10px]
                        "
                      >
                        <span className="font-light text-slate-400">
                          Segurança da senha
                        </span>

                        <span
                          className={`
                            font-medium

                            ${
                              passwordStrength <=
                              1
                                ? "text-red-500"
                                : passwordStrength ===
                                    2
                                  ? "text-amber-500"
                                  : passwordStrength ===
                                      3
                                    ? "text-blue-600"
                                    : "text-emerald-600"
                            }
                          `}
                        >
                          {
                            passwordStrengthLabel
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONFIRMAR */}

                <div>
                  <Label htmlFor="confirmarNovaSenha">
                    Confirmar nova senha
                  </Label>

                  <div className="relative mt-1">
                    <Input
                      id="confirmarNovaSenha"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        form.confirmarNovaSenha
                      }
                      hasError={
                        !!errors.confirmarNovaSenha
                      }
                      className="pr-11"
                      onChange={(e) =>
                        handleChange(
                          "confirmarNovaSenha",
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        absolute
                        right-0
                        top-1/2
                        z-20

                        flex
                        h-9
                        w-9

                        -translate-y-1/2

                        cursor-pointer

                        items-center
                        justify-center

                        rounded-[10px]

                        text-slate-400

                        transition-colors

                        hover:bg-slate-50
                        hover:text-slate-700
                      "
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      <EyeIcon
                        open={
                          showConfirmPassword
                        }
                      />
                    </button>
                  </div>

                  {errors.confirmarNovaSenha && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        errors.confirmarNovaSenha
                      }
                    </p>
                  )}

                  {form.novaSenha &&
                    form.confirmarNovaSenha &&
                    form.novaSenha ===
                      form.confirmarNovaSenha &&
                    !errors.confirmarNovaSenha && (
                      <div
                        className="
                          mt-3

                          flex
                          items-center
                          gap-2

                          text-[11px]

                          text-emerald-600
                        "
                      >
                        <span
                          className="
                            flex
                            h-5
                            w-5

                            items-center
                            justify-center

                            rounded-full

                            bg-emerald-50
                          "
                        >
                          <CheckIcon />
                        </span>

                        As senhas coincidem
                      </div>
                    )}
                </div>
              </div>
            </Panel>
          </div>

          {/* ================================================= */}
          {/* RESUMO                                           */}
          {/* ================================================= */}

          <Panel className="mt-6 p-7 sm:p-8">
            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase

                  tracking-[0.18em]

                  text-slate-400
                "
              >
                Resumo
              </p>

              <h2
                className="
                  mt-2

                  text-2xl
                  font-light

                  tracking-[-0.035em]

                  text-slate-950
                "
              >
                Informações da conta
              </h2>
            </div>

            <div
              className="
                mt-7

                grid
                gap-3

                md:grid-cols-2
              "
            >
              <ProfileInfo
                icon={<UserIcon />}
                label="Nome"
                value={
                  profileLoading
                    ? "Carregando..."
                    : form.nome || "Não informado"
                }
              />

              <ProfileInfo
                icon={<MailIcon />}
                label="E-mail"
                value={
                  profileLoading
                    ? "Carregando..."
                    : form.email || "Não informado"
                }
              />
            </div>
          </Panel>

          {/* ================================================= */}
          {/* BARRA DE SALVAMENTO                              */}
          {/* ================================================= */}

          <div
            className="
              sticky
              bottom-4
              z-30

              mt-6

              flex
              flex-col

              gap-4

              rounded-[24px]

              border
              border-slate-200/80

              bg-white/90

              p-4

              shadow-[0_18px_50px_rgba(15,23,42,0.10)]

              backdrop-blur-xl

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                className={`
                  h-2
                  w-2
                  shrink-0

                  rounded-full

                  ${
                    hasChanges
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }
                `}
              />

              <div>
                <p
                  className="
                    text-sm
                    font-normal

                    text-slate-800
                  "
                >
                  {hasChanges
                    ? "Existem alterações não salvas"
                    : "Nenhuma alteração pendente"}
                </p>

                <p
                  className="
                    mt-0.5

                    text-[11px]
                    font-light

                    text-slate-400
                  "
                >
                  {hasChanges
                    ? "Salve para atualizar sua conta."
                    : "Seu perfil está atualizado."}
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <button
                type="button"
                disabled={profileLoading || !hasChanges}
                onClick={handleDiscard}
                className="
                  inline-flex
                  h-[48px]

                  cursor-pointer

                  items-center
                  justify-center

                  rounded-[15px]

                  border
                  border-slate-200

                  bg-white

                  px-5

                  text-sm
                  font-medium

                  text-slate-500

                  transition-all
                  duration-300

                  hover:border-slate-300
                  hover:text-slate-900

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Descartar
              </button>

              <Button
                type="submit"
                loading={loading}
                disabled={profileLoading || !hasChanges}
                className="min-w-[160px]"
              >
                Salvar alterações
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SEGURANÇA ITEM
// ─────────────────────────────────────────────────────────────

function SecurityItem({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
      "
    >
      <span
        className="
          flex
          h-6
          w-6
          shrink-0

          items-center
          justify-center

          rounded-full

          bg-white

          text-emerald-600
        "
      >
        <CheckIcon />
      </span>

      <span
        className="
          text-xs
          font-light

          text-emerald-800
        "
      >
        {children}
      </span>
    </div>
  );
}