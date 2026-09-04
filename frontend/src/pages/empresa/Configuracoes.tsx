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
  nomeEmpresa: string;
  cnpj: string;
  emailCorporativo: string;
  telefone: string;
};

type FormErrors = Partial<
  Record<keyof FormState, string>
>;

type CompanyMeData = {
  id?: string;
  company_id?: string;
  corporate_name?: string;
  company_name?: string;
  name?: string;
  cnpj?: string;
  corporate_email?: string;
  company_email?: string;
  email?: string;
  phone?: string | null;
  company_phone?: string | null;
  telefone?: string | null;
  status?: string;
  company_status?: string;
};

type CompanyMeResponse = {
  data: CompanyMeData;
  success: boolean;
};

// ─────────────────────────────────────────────────────────────
// ESTADO INICIAL
// ─────────────────────────────────────────────────────────────

const initialState: FormState = {
  nomeEmpresa: "",
  cnpj: "",
  emailCorporativo: "",
  telefone: "",
};

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function BuildingIcon() {
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
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9 21v-4h6v4" />
      <path d="M8 9h.01" />
      <path d="M12 9h.01" />
      <path d="M16 9h.01" />
      <path d="M8 13h.01" />
      <path d="M12 13h.01" />
      <path d="M16 13h.01" />
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

function PhoneIcon() {
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
      <path d="M5 4h4l2 5-2.5 1.5a15 15 0 0 0 5 5L15 13l5 2v4c0 1.1-.9 2-2 2C10.3 21 3 13.7 3 6c0-1.1.9-2 2-2Z" />
    </svg>
  );
}

function DocumentIcon() {
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
      <path d="M6 3h9l3 3v15H6V3Z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
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

// ─────────────────────────────────────────────────────────────
// PANEL
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

// ─────────────────────────────────────────────────────────────
// INFO CARD
// ─────────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
  tone = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "blue" | "green";
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
        className={`
          flex
          h-10
          w-10
          shrink-0

          items-center
          justify-center

          rounded-[13px]

          ${
            tone === "green"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-blue-50 text-blue-600"
          }
        `}
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
// CONFIGURAÇÕES
// ─────────────────────────────────────────────────────────────

export default function Configuracoes() {
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

  const [companyLoading, setCompanyLoading] =
    useState(true);

  const [companyError, setCompanyError] =
    useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  const [companyMeta, setCompanyMeta] =
    useState(() => ({
      id:
        localStorage.getItem("company_id") ??
        "",
      status:
        localStorage.getItem("company_status") ??
        "",
    }));

  const companyStatus = companyMeta.status;

  // ───────────────────────────────────────────────────────────
  // CARREGAR EMPRESA
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadCompany() {
      setCompanyLoading(true);
      setCompanyError("");

      try {
        const response =
          await api.get<CompanyMeResponse>(
            "/api/v1/companies/me"
          );

        if (cancelled) {
          return;
        }

        const company = response.data?.data;

        if (!company) {
          throw new Error(
            "Resposta inválida ao carregar a empresa."
          );
        }

        const loadedForm: FormState = {
          nomeEmpresa:
            company.corporate_name ??
            company.company_name ??
            company.name ??
            "",
          cnpj: company.cnpj ?? "",
          emailCorporativo:
            company.corporate_email ??
            company.company_email ??
            company.email ??
            "",
          telefone:
            company.phone ??
            company.company_phone ??
            company.telefone ??
            "",
        };

        const loadedId =
          company.id ??
          company.company_id ??
          localStorage.getItem("company_id") ??
          "";

        const loadedStatus =
          company.status ??
          company.company_status ??
          localStorage.getItem("company_status") ??
          "";

        setForm(loadedForm);
        setSavedForm(loadedForm);
        setErrors({});

        setCompanyMeta({
          id: loadedId,
          status: loadedStatus,
        });

        if (loadedId) {
          localStorage.setItem(
            "company_id",
            loadedId
          );
        }

        if (loadedStatus) {
          localStorage.setItem(
            "company_status",
            loadedStatus
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar dados da empresa:",
          error
        );

        if (!cancelled) {
          setCompanyError(
            "Não foi possível carregar os dados da empresa."
          );
        }
      } finally {
        if (!cancelled) {
          setCompanyLoading(false);
        }
      }
    }

    void loadCompany();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // ───────────────────────────────────────────────────────────
  // ALTERAÇÕES
  // ───────────────────────────────────────────────────────────

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(form) !==
      JSON.stringify(savedForm)
    );
  }, [form, savedForm]);

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
      Object.keys(validationErrors).length >
      0
    ) {
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Atualizar dados da empresa:",
        form
      );

      /*
       * TODO:
       *
       * Carregamento já implementado:
       * GET /api/v1/companies/me
       *
       * Salvar (quando o backend estiver pronto):
       * PUT /api/v1/companies/me
       *
       * Exemplo futuro:
       *
       * await api.put(
       *   "/api/v1/companies/me",
       *   {
       *     company_name: form.nomeEmpresa,
       *     cnpj: form.cnpj,
       *     corporate_email:
       *       form.emailCorporativo,
       *     company_phone:
       *       form.telefone,
       *   }
       * );
       */

      // Só use isto depois do PUT realmente funcionar:
      // setSavedForm(form);

    } catch {
      setSubmitError(
        "Não foi possível salvar as alterações."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDiscard() {
    setForm(savedForm);
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
            Administração
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
            Configurações da empresa
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
            Gerencie os dados institucionais e
            informações de contato vinculadas à
            sua conta empresarial.
          </p>
        </header>

        {companyLoading && (
          <div className="mt-6">
            <Panel className="p-5">
              <p className="text-sm font-light text-slate-500">
                Carregando dados da empresa...
              </p>
            </Panel>
          </div>
        )}

        {companyError && (
          <div className="mt-6">
            <ErrorMessage>
              {companyError}
            </ErrorMessage>

            <button
              type="button"
              onClick={() =>
                setReloadKey((prev) => prev + 1)
              }
              className="
                mt-3
                inline-flex
                h-10
                items-center
                justify-center
                rounded-[13px]
                border
                border-slate-200
                bg-white
                px-4
                text-xs
                font-medium
                text-slate-700
                transition-all
                hover:border-slate-300
              "
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* =================================================== */}
        {/* RESUMO DA EMPRESA                                  */}
        {/* =================================================== */}

        <div
          className="
            mt-10

            grid
            gap-6

            xl:grid-cols-[1.3fr_0.7fr]
          "
        >
          {/* EMPRESA */}

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
            <div
              className="
                pointer-events-none

                absolute
                -right-20
                -top-20

                h-72
                w-72

                rounded-full

                bg-blue-500/20

                blur-[90px]
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                -bottom-28
                left-[20%]

                h-72
                w-72

                rounded-full

                bg-emerald-500/20

                blur-[90px]
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                right-14
                top-10

                h-36
                w-36

                rounded-full

                border
                border-white/[0.06]
              "
            />

            <div className="relative z-10">
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

                      tracking-[0.2em]

                      text-emerald-300
                    "
                  >
                    Empresa
                  </p>

                  <h2
                    className="
                      mt-4

                      text-4xl
                      font-light

                      tracking-[-0.055em]

                      text-white

                      sm:text-5xl
                    "
                  >
                    {companyLoading
                      ? "Carregando..."
                      : form.nomeEmpresa ||
                        "Sua empresa"}
                  </h2>
                </div>

                <span
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0

                    items-center
                    justify-center

                    rounded-[16px]

                    bg-white/[0.08]

                    text-white/80

                    backdrop-blur-xl
                  "
                >
                  <BuildingIcon />
                </span>
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
                    CNPJ
                  </p>

                  <p
                    className="
                      mt-2

                      text-sm
                      font-light

                      text-white/75
                    "
                  >
                    {form.cnpj || "—"}
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
                    Status da conta
                  </p>

                  <div
                    className="
                      mt-2

                      flex
                      items-center
                      gap-2
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

                    <p
                      className="
                        text-sm
                        font-light

                        text-white/75
                      "
                    >
                      {companyStatus || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEGURANÇA */}

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
                  Conta
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
                  Dados protegidos
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
              Mantenha os dados corporativos
              atualizados para garantir a correta
              identificação da empresa na
              plataforma.
            </p>

            <div
              className="
                mt-7

                rounded-[20px]

                bg-emerald-50/70

                p-5
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <span
                  className="
                    mt-0.5

                    flex
                    h-7
                    w-7
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

                <p
                  className="
                    text-xs
                    font-light
                    leading-5

                    text-emerald-800
                  "
                >
                  Alterações sensíveis devem ser
                  validadas pelo backend antes de
                  serem efetivamente aplicadas.
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* =================================================== */}
        {/* FORMULÁRIO                                         */}
        {/* =================================================== */}

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

              xl:grid-cols-[1.1fr_0.9fr]
            "
          >
            {/* =============================================== */}
            {/* IDENTIFICAÇÃO                                   */}
            {/* =============================================== */}

            <Panel className="p-7 sm:p-8">
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
                  Identificação
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
                  Dados da empresa
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
                  identificar sua organização.
                </p>
              </div>

              <div className="mt-9 space-y-8">
                {/* NOME */}

                <div>
                  <Label htmlFor="nomeEmpresa">
                    Nome da empresa
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="nomeEmpresa"
                      disabled={companyLoading}
                      value={
                        form.nomeEmpresa
                      }
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
                      {
                        errors.nomeEmpresa
                      }
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
                      disabled={companyLoading}
                      value={form.cnpj}
                      hasError={
                        !!errors.cnpj
                      }
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

                  <p
                    className="
                      mt-3

                      text-[11px]
                      font-light
                      leading-5

                      text-slate-400
                    "
                  >
                    O CNPJ identifica juridicamente
                    a empresa vinculada à conta.
                  </p>
                </div>
              </div>
            </Panel>

            {/* =============================================== */}
            {/* CONTATO                                         */}
            {/* =============================================== */}

            <Panel className="p-7 sm:p-8">
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
                  Comunicação
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
                  Dados de contato
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
                  Canais corporativos vinculados
                  à organização.
                </p>
              </div>

              <div className="mt-9 space-y-8">
                {/* EMAIL */}

                <div>
                  <Label htmlFor="emailCorporativo">
                    E-mail corporativo
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="emailCorporativo"
                      disabled={companyLoading}
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

                {/* TELEFONE */}

                <div>
                  <Label htmlFor="telefone">
                    Telefone
                  </Label>

                  <div className="mt-1">
                    <Input
                      id="telefone"
                      disabled={companyLoading}
                      type="tel"
                      value={
                        form.telefone
                      }
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
                      {
                        errors.telefone
                      }
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          {/* ================================================= */}
          {/* PRÉVIA DOS DADOS                                 */}
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
                Informações cadastradas
              </h2>
            </div>

            <div
              className="
                mt-7

                grid
                gap-3

                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              <InfoCard
                icon={
                  <BuildingIcon />
                }
                label="Empresa"
                value={
                  form.nomeEmpresa ||
                  "Não informado"
                }
              />

              <InfoCard
                icon={
                  <DocumentIcon />
                }
                label="CNPJ"
                value={
                  form.cnpj ||
                  "Não informado"
                }
              />

              <InfoCard
                icon={<MailIcon />}
                label="E-mail"
                value={
                  form.emailCorporativo ||
                  "Não informado"
                }
                tone="green"
              />

              <InfoCard
                icon={<PhoneIcon />}
                label="Telefone"
                value={
                  form.telefone ||
                  "Não informado"
                }
                tone="green"
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
                    ? "Salve para aplicar as mudanças."
                    : "Os dados estão atualizados."}
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
                disabled={
                  !hasChanges || companyLoading
                }
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
                disabled={
                  !hasChanges || companyLoading
                }
                className="
                  min-w-[160px]
                "
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