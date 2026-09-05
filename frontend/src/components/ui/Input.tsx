import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`
          w-full border-0 border-b-2 bg-transparent px-0 py-3.5 font-sans
          text-[15px] font-medium text-brand-dark outline-none
          transition-colors duration-200
          placeholder:font-normal placeholder:text-slate-400
          disabled:cursor-not-allowed disabled:opacity-50
          ${
            hasError
              ? "border-red-300 focus:border-red-500"
              : "border-slate-200 focus:border-brand-accent-blue"
          }
          ${className}
        `}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
