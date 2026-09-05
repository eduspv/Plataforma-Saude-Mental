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
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
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
    >
      <rect x="5" y="10" width="14" height="11" rx="3" />
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
    >
      <path d="M12 3.5 5 6v5.2c0 4.7 2.9 8.3 7 9.8 4.1-1.5 7-5.1 7-9.8V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
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
    >
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

function EyeIcon({
  visible,
}: {
  visible: boolean;
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
    >
      {visible ? (
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

// ─────────────────────────────────────────────────────────────
// COMPONENTES
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
        border border-slate-200/80
        bg-white
        shadow-[0_15px_50px_rgba(15,23,42,0.045)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function SecurityItem({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="
          flex h-6 w-6 shrink-0
          items-center justify-center
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
          leading-5
          text-emerald-800
        "
      >
        {children}
      </span>
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

  const [showPassword, setShowPassword] =
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
      !!form.novaSenha ||
      !!form.confirmarNovaSenha
    );
  }, [form, savedForm]);

  // ───────────────────────────────────────────────────────────
  // INICIAIS
  // ───────────────────────────────────────────────────────────

  const initials = useMemo(() => {
    const name = form.nome.trim();

    if (!name) {
      return "EU";
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

  const passwordLabel =
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
  // ALTERAR
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
  // VALIDAR
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
  // SALVAR
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
      Object.keys(validationErrors)
        .length > 0
    ) {
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Atualizar perfil do colaborador:",
        form
      );

      /*
        TODO:

        GET /api/v1/users/me
        PUT /api/v1/users/me

        Exemplo futuro:

        await api.put(
          "/api/v1/users/me",
          {
            name: form.nome,
            email: form.email,
            password:
              form.novaSenha ||
              undefined,
          }
        );
      */

      /*
        Quando o PUT estiver funcionando:

        const saved = {
          nome: form.nome,
          email: form.email,
          novaSenha: "",
          confirmarNovaSenha: "",
        };

        setSavedForm(saved);
        setForm(saved);
      */

    } catch {
      setSubmitError(
        "Não foi possível salvar as alterações."
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
      <div className="mx-auto max-w-[1300px]">
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

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
            Sua conta
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
            Gerencie suas informações pessoais
            e mantenha seus dados de acesso
            atualizados.
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
              className="mt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* ================================================= */}
        {/* PERFIL SUPERIOR                                  */}
        {/* ================================================= */}

        <div
          className="
            mt-10
            grid
            gap-6
            xl:grid-cols-[1.3fr_0.7fr]
          "
        >
          {/* CARD PRINCIPAL */}

          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[34px]
              bg-slate-950
              p-7
              text-white
              shadow-[0_24px_70px_rgba(15,23,42,0.15)]
              sm:p-9
            "
          >
            {/* GLOW */}

            <div
              className="
                pointer-events-none
                absolute
                -right-28
                -top-28
                h-[380px]
                w-[380px]
                rounded-full
                bg-blue-500/20
                blur-[105px]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-36
                left-[18%]
                h-[350px]
                w-[350px]
                rounded-full
                bg-emerald-500/20
                blur-[105px]
              "
            />

            {/* CÍRCULOS */}

            <div
              className="
                pointer-events-none
                absolute
                right-14
                top-12
                h-48
                w-48
                rounded-full
                border
                border-white/[0.055]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                right-[86px]
                top-[78px]
                h-32
                w-32
                rounded-full
                border
                border-emerald-300/10
              "
            />

            <div className="relative z-10">
              <div
                className="
                  flex
                  flex-col
                  gap-6
                  sm:flex-row
                  sm:items-center
                "
              >
                {/* AVATAR */}

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
                  {profileLoading ? "…" : initials}
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
                    Colaborador
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

          {/* SEGURANÇA */}

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
              Use uma senha exclusiva e evite
              compartilhar seus dados de acesso.
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
                Mínimo de 8 caracteres
              </SecurityItem>

              <SecurityItem>
                Combine letras, números e símbolos
              </SecurityItem>

              <SecurityItem>
                Não compartilhe sua senha
              </SecurityItem>
            </div>
          </Panel>
        </div>

        {/* ================================================= */}
        {/* FORMULÁRIO                                       */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6"
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
            {/* ============================================= */}
            {/* DADOS PESSOAIS                               */}
            {/* ============================================= */}

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
                    Informações vinculadas à sua
                    conta.
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
                      autoComplete="name"
                      onChange={(e) =>
                        handleChange(
                          "nome",
                          e.target.value
                        )
                      }
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
                      autoComplete="email"
                      onChange={(e) =>
                        handleChange(
                          "email",
                          e.target.value
                        )
                      }
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
                    Este endereço é utilizado
                    para acessar sua conta.
                  </p>
                </div>
              </div>
            </Panel>

            {/* ============================================= */}
            {/* SENHA                                        */}
            {/* ============================================= */}

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
                    Deixe os campos vazios caso
                    não queira alterar sua senha.
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
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        form.novaSenha
                      }
                      hasError={
                        !!errors.novaSenha
                      }
                      className="pr-12"
                      autoComplete="new-password"
                      onChange={(e) =>
                        handleChange(
                          "novaSenha",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
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
                        transition-all
                        hover:bg-slate-50
                        hover:text-slate-800
                      "
                      aria-label={
                        showPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      <EyeIcon
                        visible={
                          showPassword
                        }
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

                  {/* FORÇA */}

                  {form.novaSenha && (
                    <div className="mt-4">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(
                          (level) => (
                            <span
                              key={
                                level
                              }
                              className={`
                                h-1
                                flex-1
                                rounded-full
                                transition-all
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
                          )
                        )}
                      </div>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <span
                          className="
                            text-[10px]
                            font-light
                            text-slate-400
                          "
                        >
                          Segurança da senha
                        </span>

                        <span
                          className={`
                            text-[10px]
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
                          {passwordLabel}
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
                      className="pr-12"
                      autoComplete="new-password"
                      onChange={(e) =>
                        handleChange(
                          "confirmarNovaSenha",
                          e.target.value
                        )
                      }
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
                        transition-all
                        hover:bg-slate-50
                        hover:text-slate-800
                      "
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      <EyeIcon
                        visible={
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
          {/* BARRA DE SALVAMENTO                            */}
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
            <div className="flex items-center gap-3">
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
                onClick={handleDiscard}
                disabled={profileLoading || !hasChanges}
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
                className="min-w-[170px]"
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