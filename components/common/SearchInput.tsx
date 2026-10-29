"use client";

import type {
  InputHTMLAttributes,
} from "react";

interface SearchInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    onChange("");
  };

  return (
    <div
      className={`
        relative
        w-full
        ${className}
      `}
    >
      {/* Search icon */}
      <div
        className="
          pointer-events-none
          absolute
          left-3.5
          top-1/2
          z-10
          flex
          -translate-y-1/2
          items-center
          justify-center
          text-[#64748b]
        "
      >
        <SearchIcon />
      </div>

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-[#dbeafe]
          bg-white
          pl-10
          pr-10
          text-sm
          text-[#0f172a]
          outline-none
          transition-all
          duration-200

          placeholder:text-[#64748b]

          hover:border-[#D1CCC2]

          focus:border-[#60a5fa]
          focus:ring-2
          focus:ring-[#60a5fa]/15

          disabled:cursor-not-allowed
          disabled:bg-[#eff6ff]
          disabled:text-[#64748b]

          [&::-webkit-search-cancel-button]:hidden
        "
        {...props}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          disabled={props.disabled}
          aria-label="Clear search"
          className="
            absolute
            right-2.5
            top-1/2
            flex
            h-7
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-lg
            text-[#64748b]
            transition-colors
            hover:bg-[#eff6ff]
            hover:text-[#0f172a]
            focus:outline-none
            focus:ring-2
            focus:ring-[#60a5fa]/30
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}