import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import { api } from "../../lib/api";

import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type Option = {
  id: number;
  label: string;
};

type Question = {
  id: string;
  type: string;
  text: string;
  order: number;
  options?: Option[];
};

type Step = {
  step: number;
  questions: Question[];
};

type FormData = {
  form_version: number;
  steps: Step[];
};

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function ClipboardIcon() {
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
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M8 10h8" />
      <path d="M8 14h6" />
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

// ─────────────────────────────────────────────────────────────
// ESCALA 1–5
// ─────────────────────────────────────────────────────────────

function ScaleSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const selected =
    value ? Number(value) : null;

  const progress =
    selected !== null
      ? ((selected - 1) / 4) * 100
      : 0;

  return (
    <div
      className="
        mt-6
        rounded-[24px]
        bg-slate-50/80
        px-5
        pb-5
        pt-6
        sm:px-7
      "
    >
      {/* TEXTO SUPERIOR */}

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <p
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-[0.16em]
            text-slate-400
          "
        >
          Selecione de 1 a 5
        </p>

        {selected !== null && (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-white
              px-3
              py-1.5
              text-[10px]
              font-medium
              text-emerald-700
              shadow-[0_5px_18px_rgba(15,23,42,0.05)]
            "
          >
            <span
              className="
                flex
                h-4
                w-4
                items-center
                justify-center
                rounded-full
                bg-emerald-50
              "
            >
              <CheckIcon />
            </span>

            Selecionado
          </div>
        )}
      </div>

      {/* ESCALA */}

      <div className="relative">
        {/* LINHA BASE */}

        <div
          className="
            absolute
            left-[10%]
            right-[10%]
            top-6
            h-[3px]
            -translate-y-1/2
            rounded-full
            bg-slate-200
          "
        />

        {/* LINHA PREENCHIDA */}

        <div
          className="
            absolute
            left-[10%]
            top-6
            h-[3px]
            -translate-y-1/2
            rounded-full
            bg-gradient-to-r
            from-blue-500
            via-blue-500
            to-emerald-500
            transition-[width]
            duration-500
            ease-out
          "
          style={{
            width:
              selected === null
                ? "0%"
                : `${progress * 0.8}%`,
          }}
        />

        {/* PONTOS */}

        <div
          className="
            relative
            z-10
            grid
            grid-cols-5
          "
        >
          {[1, 2, 3, 4, 5].map(
            (number) => {
              const isSelected =
                selected === number;

              const isBefore =
                selected !== null &&
                number < selected;

              return (
                <button
                  key={number}
                  type="button"
                  aria-pressed={
                    isSelected
                  }
                  onClick={() =>
                    onChange(
                      String(number)
                    )
                  }
                  className="
                    group
                    flex
                    cursor-pointer
                    flex-col
                    items-center
                    outline-none
                  "
                >
                  {/* CÍRCULO */}

                  <span
                    className={`
                      relative

                      flex
                      h-12
                      w-12

                      items-center
                      justify-center

                      rounded-full

                      text-sm
                      font-medium

                      transition-all
                      duration-300
                      ease-out

                      ${
                        isSelected
                          ? `
                            scale-110
                            bg-slate-950
                            text-white
                            shadow-[0_12px_30px_rgba(15,23,42,0.20)]
                          `
                          : isBefore
                            ? `
                              bg-blue-600
                              text-white
                            `
                            : `
                              border
                              border-slate-200
                              bg-white
                              text-slate-500
                              shadow-[0_4px_15px_rgba(15,23,42,0.04)]

                              group-hover:-translate-y-1
                              group-hover:border-blue-300
                              group-hover:text-blue-600
                            `
                      }
                    `}
                  >
                    {number}

                    {/* HALO DO SELECIONADO */}

                    {isSelected && (
                      <span
                        className="
                          pointer-events-none
                          absolute
                          -inset-2
                          -z-10
                          rounded-full
                          bg-gradient-to-r
                          from-blue-400/20
                          to-emerald-400/20
                          blur-md
                        "
                      />
                    )}
                  </span>

                  {/* MARCADOR ABAIXO */}

                  <span
                    className={`
                      mt-3
                      h-1
                      rounded-full
                      transition-all
                      duration-300

                      ${
                        isSelected
                          ? "w-5 bg-emerald-500"
                          : "w-1 bg-transparent"
                      }
                    `}
                  />
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* EXTREMIDADES */}

      <div
        className="
          mt-2
          flex
          justify-between
          px-[6%]
        "
      >
        <span
          className="
            text-[9px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-slate-300
          "
        >
          1
        </span>

        <span
          className="
            text-[9px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-slate-300
          "
        >
          5
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// YES / NO
// ─────────────────────────────────────────────────────────────

function YesNoSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const options = [
    {
      value: "yes",
      label: "Sim",
    },
    {
      value: "no",
      label: "Não",
    },
  ];

  return (
    <div
      className="
        mt-6
        grid
        grid-cols-2
        gap-3
        sm:max-w-md
      "
    >
      {options.map((option) => {
        const selected =
          value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(option.value)
            }
            className={`
              relative

              flex
              h-[54px]

              cursor-pointer

              items-center
              justify-center
              gap-2

              rounded-[17px]

              text-sm
              font-medium

              transition-all
              duration-300

              ${
                selected
                  ? `
                    bg-slate-950
                    text-white
                    shadow-[0_10px_25px_rgba(15,23,42,0.13)]
                  `
                  : `
                    border
                    border-slate-200
                    bg-white
                    text-slate-500

                    hover:-translate-y-0.5
                    hover:border-blue-200
                    hover:bg-blue-50/50
                    hover:text-blue-700
                  `
              }
            `}
          >
            {selected && (
              <span
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                "
              >
                <CheckIcon />
              </span>
            )}

            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MULTIPLE CHOICE
// ─────────────────────────────────────────────────────────────

function MultipleChoiceSelector({
  options,
  value,
  onChange,
}: {
  options?: Option[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="
        mt-6
        grid
        gap-3
        sm:grid-cols-2
      "
    >
      {options?.map((option) => {
        const selected =
          value === String(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              onChange(
                String(option.id)
              )
            }
            className={`
              group

              flex
              min-h-[58px]

              cursor-pointer

              items-center
              gap-3

              rounded-[18px]

              px-4
              py-3

              text-left
              text-sm

              transition-all
              duration-300

              ${
                selected
                  ? `
                    bg-slate-950
                    text-white
                    shadow-[0_10px_25px_rgba(15,23,42,0.12)]
                  `
                  : `
                    border
                    border-slate-200
                    bg-white
                    text-slate-600

                    hover:-translate-y-0.5
                    hover:border-blue-200
                    hover:bg-blue-50/40
                  `
              }
            `}
          >
            <span
              className={`
                flex
                h-7
                w-7
                shrink-0

                items-center
                justify-center

                rounded-[9px]

                text-[11px]
                font-medium

                transition-colors

                ${
                  selected
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                }
              `}
            >
              {selected ? (
                <CheckIcon />
              ) : (
                option.id
              )}
            </span>

            <span className="font-light">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="mt-8 animate-pulse">
      <div
        className="
          h-[150px]
          rounded-[30px]
          bg-slate-200/60
        "
      />

      <div
        className="
          mt-5
          h-[300px]
          rounded-[30px]
          bg-slate-200/60
        "
      />

      <div
        className="
          mt-5
          h-[300px]
          rounded-[30px]
          bg-slate-200/60
        "
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DIAGNÓSTICO
// ─────────────────────────────────────────────────────────────

export default function Diagnostico() {
  const [form, setForm] =
    useState<FormData | null>(
      null
    );

  const [answers, setAnswers] =
    useState<
      Record<string, string>
    >({});

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const navigate =
    useNavigate();

  // ───────────────────────────────────────────────────────────
  // CARREGAR FORMULÁRIO
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadForm() {
      setLoading(true);
      setLoadError("");

      try {
        const response =
          await api.get(
            "/api/v1/diagnostic/form"
          );

        if (!cancelled) {
          setForm(
            response.data.data
          );
        }
      } catch {
        if (!cancelled) {
          setLoadError(
            "Não foi possível carregar o formulário. Tente novamente."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadForm();

    return () => {
      cancelled = true;
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // PERGUNTAS
  // ───────────────────────────────────────────────────────────

  const allQuestions = useMemo(
    () =>
      form?.steps.flatMap(
        (step) =>
          step.questions
      ) ?? [],
    [form]
  );

  const answeredCount =
    useMemo(
      () =>
        allQuestions.filter(
          (question) =>
            Boolean(
              answers[
                question.id
              ]
            )
        ).length,
      [allQuestions, answers]
    );

  const progress =
    allQuestions.length > 0
      ? Math.round(
          (answeredCount /
            allQuestions.length) *
            100
        )
      : 0;

  const allAnswered =
    allQuestions.length > 0 &&
    answeredCount ===
      allQuestions.length;

  // ───────────────────────────────────────────────────────────
  // RESPOSTA
  // ───────────────────────────────────────────────────────────

  function handleAnswer(
    questionId: string,
    value: string
  ) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    if (submitError) {
      setSubmitError("");
    }
  }

  // ───────────────────────────────────────────────────────────
  // ENVIAR
  // ───────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (
      !form ||
      !allAnswered
    ) {
      setSubmitError(
        "Responda todas as perguntas antes de enviar."
      );

      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const response =
        await api.post(
          "/api/v1/diagnostic/submit-form",
          {
            form_version:
              form.form_version,

            answers:
              allQuestions.map(
                (question) => ({
                  question_id:
                    question.id,

                  value:
                    answers[
                      question.id
                    ],
                })
              ),
          }
        );

      navigate(
        "/colaborador/resultado/ultimo",
        {
          state:
            response.data.data,
        }
      );
    } catch (err) {
      if (
        axios.isAxiosError(
          err
        ) &&
        err.response?.status ===
          409
      ) {
        setSubmitError(
          "Você já respondeu o diagnóstico hoje."
        );
      } else {
        setSubmitError(
          "Não foi possível enviar. Tente novamente."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="
        min-h-full
        font-['Manrope',sans-serif]
      "
    >
      <div
        className="
          mx-auto
          max-w-[1200px]
        "
      >
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
            Avaliação
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
            Diagnóstico
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
            Responda cada pergunta com
            atenção e escolha a alternativa
            que melhor representa sua
            resposta.
          </p>
        </header>

        {/* =================================================== */}
        {/* ERROS                                               */}
        {/* =================================================== */}

        {loadError && (
          <div className="mt-6">
            <ErrorMessage>
              {loadError}
            </ErrorMessage>
          </div>
        )}

        {submitError && (
          <div className="mt-6">
            <ErrorMessage>
              {submitError}
            </ErrorMessage>
          </div>
        )}

        {/* =================================================== */}
        {/* LOADING                                             */}
        {/* =================================================== */}

        {loading && (
          <LoadingState />
        )}

        {/* =================================================== */}
        {/* FORMULÁRIO                                          */}
        {/* =================================================== */}

        {!loading &&
          form && (
            <>
              {/* ============================================= */}
              {/* PROGRESSO                                    */}
              {/* ============================================= */}

              <Panel
                className="
                  mt-8
                  overflow-hidden
                  p-6
                  sm:p-7
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-5

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >
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
                      <ClipboardIcon />
                    </span>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-medium
                          uppercase

                          tracking-[0.16em]

                          text-slate-400
                        "
                      >
                        Seu progresso
                      </p>

                      <p
                        className="
                          mt-1

                          text-sm
                          font-light

                          text-slate-700
                        "
                      >
                        {answeredCount} de{" "}
                        {
                          allQuestions.length
                        }{" "}
                        perguntas respondidas
                      </p>
                    </div>
                  </div>

                  <p
                    className="
                      text-3xl
                      font-light

                      tracking-[-0.05em]

                      text-slate-950
                    "
                  >
                    {progress}%
                  </p>
                </div>

                <div
                  className="
                    mt-6

                    h-2
                    w-full

                    overflow-hidden

                    rounded-full

                    bg-slate-100
                  "
                >
                  <div
                    className="
                      h-full

                      rounded-full

                      bg-gradient-to-r
                      from-blue-500
                      to-emerald-500

                      transition-[width]
                      duration-500
                    "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </Panel>

              {/* ============================================= */}
              {/* ETAPAS                                       */}
              {/* ============================================= */}

              <div
                className="
                  mt-6
                  space-y-8
                "
              >
                {form.steps.map(
                  (step) => (
                    <section
                      key={step.step}
                    >
                      {/* TÍTULO DA ETAPA */}

                      <div
                        className="
                          mb-4

                          flex
                          items-center
                          gap-3
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-medium
                            uppercase

                            tracking-[0.18em]

                            text-blue-600
                          "
                        >
                          Etapa{" "}
                          {String(
                            step.step
                          ).padStart(
                            2,
                            "0"
                          )}
                        </p>

                        <div
                          className="
                            h-px
                            flex-1

                            bg-gradient-to-r
                            from-slate-200
                            to-transparent
                          "
                        />
                      </div>

                      {/* PERGUNTAS */}

                      <div className="space-y-4">
                        {step.questions.map(
                          (
                            question
                          ) => {
                            const globalIndex =
                              allQuestions.findIndex(
                                (item) =>
                                  item.id ===
                                  question.id
                              );

                            const answered =
                              Boolean(
                                answers[
                                  question
                                    .id
                                ]
                              );

                            return (
                              <Panel
                                key={
                                  question.id
                                }
                                className="
                                  relative
                                  overflow-hidden
                                  p-6
                                  sm:p-8
                                "
                              >
                                {/* GLOW QUANDO RESPONDIDA */}

                                {answered && (
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
                                    "
                                  />
                                )}

                                <div className="relative z-10">
                                  {/* CABEÇALHO PERGUNTA */}

                                  <div
                                    className="
                                      flex
                                      items-start
                                      gap-4
                                    "
                                  >
                                    <span
                                      className={`
                                        flex
                                        h-9
                                        min-w-9
                                        shrink-0

                                        items-center
                                        justify-center

                                        rounded-[12px]

                                        text-[11px]
                                        font-medium

                                        transition-all
                                        duration-300

                                        ${
                                          answered
                                            ? `
                                              bg-emerald-50
                                              text-emerald-600
                                            `
                                            : `
                                              bg-slate-100
                                              text-slate-400
                                            `
                                        }
                                      `}
                                    >
                                      {answered ? (
                                        <CheckIcon />
                                      ) : (
                                        String(
                                          globalIndex +
                                            1
                                        ).padStart(
                                          2,
                                          "0"
                                        )
                                      )}
                                    </span>

                                    <div className="min-w-0">
                                      <p
                                        className="
                                          text-base
                                          font-normal
                                          leading-7

                                          tracking-[-0.015em]

                                          text-slate-900

                                          sm:text-[17px]
                                        "
                                      >
                                        {
                                          question.text
                                        }
                                      </p>

                                      <p
                                        className="
                                          mt-2

                                          text-[11px]
                                          font-light

                                          text-slate-400
                                        "
                                      >
                                        Selecione
                                        uma opção
                                      </p>
                                    </div>
                                  </div>

                                  {/* ================================= */}
                                  {/* ESCALA 1 A 5                     */}
                                  {/* ================================= */}

                                  {question.type ===
                                    "scale_1_5" && (
                                    <ScaleSelector
                                      value={
                                        answers[
                                          question
                                            .id
                                        ]
                                      }
                                      onChange={(
                                        value
                                      ) =>
                                        handleAnswer(
                                          question.id,
                                          value
                                        )
                                      }
                                    />
                                  )}

                                  {/* ================================= */}
                                  {/* SIM / NÃO                         */}
                                  {/* ================================= */}

                                  {question.type ===
                                    "yes_no" && (
                                    <YesNoSelector
                                      value={
                                        answers[
                                          question
                                            .id
                                        ]
                                      }
                                      onChange={(
                                        value
                                      ) =>
                                        handleAnswer(
                                          question.id,
                                          value
                                        )
                                      }
                                    />
                                  )}

                                  {/* ================================= */}
                                  {/* MÚLTIPLA ESCOLHA                  */}
                                  {/* ================================= */}

                                  {question.type ===
                                    "multiple_choice" && (
                                    <MultipleChoiceSelector
                                      options={
                                        question.options
                                      }
                                      value={
                                        answers[
                                          question
                                            .id
                                        ]
                                      }
                                      onChange={(
                                        value
                                      ) =>
                                        handleAnswer(
                                          question.id,
                                          value
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              </Panel>
                            );
                          }
                        )}
                      </div>
                    </section>
                  )
                )}
              </div>

              {/* ============================================= */}
              {/* FINALIZAÇÃO                                  */}
              {/* ============================================= */}

              <div
                className="
                  relative

                  mt-8

                  overflow-hidden

                  rounded-[30px]

                  border
                  border-slate-200/80

                  bg-white

                  p-6

                  shadow-[0_15px_50px_rgba(15,23,42,0.05)]

                  sm:p-8
                "
              >
                <div
                  className="
                    pointer-events-none

                    absolute
                    -right-24
                    -top-24

                    h-64
                    w-64

                    rounded-full

                    bg-emerald-200/20

                    blur-[80px]
                  "
                />

                <div
                  className="
                    relative
                    z-10

                    flex
                    flex-col

                    gap-6

                    md:flex-row
                    md:items-center
                    md:justify-between
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
                      Finalização
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
                      {allAnswered
                        ? "Tudo pronto para enviar."
                        : "Continue respondendo."}
                    </h2>

                    <p
                      className="
                        mt-2

                        max-w-xl

                        text-sm
                        font-light
                        leading-6

                        text-slate-400
                      "
                    >
                      {allAnswered
                        ? "Todas as perguntas foram respondidas. Revise suas escolhas antes de finalizar."
                        : `Ainda faltam ${
                            allQuestions.length -
                            answeredCount
                          } pergunta(s) para concluir o diagnóstico.`}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={
                      handleSubmit
                    }
                    loading={
                      submitting
                    }
                    disabled={
                      !allAnswered
                    }
                    className="
                      min-w-[210px]
                      self-start

                      md:self-auto
                    "
                  >
                    Enviar respostas
                  </Button>
                </div>
              </div>

              {/* ============================================= */}
              {/* PRIVACIDADE                                  */}
              {/* ============================================= */}

              <div
                className="
                  mt-6

                  flex
                  items-start
                  gap-4

                  rounded-[24px]

                  bg-emerald-50/60

                  p-5
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

                    text-emerald-600
                  "
                >
                  <ShieldIcon />
                </span>

                <div>
                  <p
                    className="
                      text-sm
                      font-medium

                      text-slate-800
                    "
                  >
                    Responda com tranquilidade
                  </p>

                  <p
                    className="
                      mt-1

                      max-w-3xl

                      text-xs
                      font-light
                      leading-5

                      text-slate-500
                    "
                  >
                    Suas respostas devem ser
                    tratadas conforme as regras de
                    privacidade e proteção de dados
                    definidas para a plataforma.
                  </p>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}