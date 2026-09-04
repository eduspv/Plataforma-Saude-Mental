import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      loading = false,
      disabled = false,
      variant = "primary",
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variants = {
      primary:
        "bg-brand-dark text-white hover:bg-brand-dark-soft",
      secondary:
        "border border-slate-200 bg-white text-brand-dark hover:border-slate-300 hover:bg-slate-50",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-brand-dark",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        {...props}
        className={`
          inline-flex min-h-[52px] cursor-pointer items-center justify-center
          gap-2 rounded-2xl px-6 py-3.5 font-sans text-sm font-semibold
          tracking-[-0.01em] outline-none transition-all duration-200
          ease-out
          hover:-translate-y-px
          active:translate-y-0
          focus-visible:ring-2 focus-visible:ring-brand-accent-blue/40 focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0
          ${variants[variant]}
          ${className}
        `}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />
            <span>Aguarde...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
