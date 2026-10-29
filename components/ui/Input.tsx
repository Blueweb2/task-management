import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  rightIcon?: ReactNode;
  variant?: "light" | "dark";
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightElement,
  rightIcon,
  variant = "light",
  containerClassName = "",
  className = "",
  id,
  ...props
}: InputProps) {
  const rightContent = rightElement || rightIcon;
  const inputId =
    id ||
    (label
      ? label
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : undefined);

  const isDark = variant === "dark";

  return (
    <div className={`w-full min-w-0 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`mb-1.5 block text-sm font-semibold ${
            isDark ? "text-gray-200" : "text-[#0f172a]"
          }`}
        >
          {label}

          {required && (
            <span
              className={`ml-1 ${
                isDark ? "text-[#93c5fd]" : "text-[#60a5fa]"
              }`}
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="relative min-w-0">
        {leftIcon && (
          <div
            className={`pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center ${
              isDark ? "text-[#93c5fd]" : "text-[#64748b]"
            }`}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            h-11
            w-full
            min-w-0
            rounded-xl
            border
            px-3.5
            text-sm
            outline-none
            transition-all
            duration-200

            ${
              isDark
                ? `
                  border-[#333333]
                  bg-[#111111]
                  text-gray-100
                  placeholder:text-gray-600
                  disabled:bg-[#0f172a]
                  disabled:text-gray-600
                  ${
                    error
                      ? "border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                      : "focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd]/15"
                  }
                `
                : `
                  border-[#dbeafe]
                  bg-white
                  text-[#0f172a]
                  placeholder:text-gray-400
                  shadow-2xs
                  disabled:bg-[#ffffff]
                  disabled:text-gray-400
                  ${
                    error
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                      : "focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20"
                  }
                `
            }

            disabled:cursor-not-allowed

            ${leftIcon ? "pl-10" : ""}
            ${rightElement ? "pr-11" : ""}
            ${className}
          `}
          {...props}
        />

        {rightContent && (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
            {rightContent}
          </div>
        )}
      </div>

      {error ? (
        <p
          className={`mt-1.5 text-xs ${
            isDark ? "text-red-400" : "text-rose-600"
          }`}
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          className={`mt-1.5 text-xs ${
            isDark ? "text-gray-500" : "text-[#475569]"
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}