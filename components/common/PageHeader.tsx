import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  backHref?: string;
  backLabel?: string;
  className?: string;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  backHref,
  backLabel = "Back",
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`
        mb-6
        w-full
        ${className}
      `}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 overflow-x-auto text-sm"
        >
          {breadcrumbs.map(
            (breadcrumb, index) => {
              const isLast =
                index === breadcrumbs.length - 1;

              return (
                <div
                  key={`${breadcrumb.label}-${index}`}
                  className="flex shrink-0 items-center gap-1.5"
                >
                  {breadcrumb.href &&
                  !isLast ? (
                    <Link
                      href={breadcrumb.href}
                      className="
                        text-[#64748b]
                        transition-colors
                        hover:text-[#0f172a]
                      "
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? "font-medium text-[#0f172a]"
                          : "text-[#64748b]"
                      }
                    >
                      {breadcrumb.label}
                    </span>
                  )}

                  {!isLast && (
                    <ChevronRight />
                  )}
                </div>
              );
            },
          )}
        </nav>
      )}

      {/* Back button */}
      {backHref && (
        <Link
          href={backHref}
          className="
            mb-4
            inline-flex
            items-center
            gap-1.5
            text-sm
            font-medium
            text-[#64748b]
            transition-colors
            hover:text-[#0f172a]
          "
        >
          <ChevronLeft />

          <span>{backLabel}</span>
        </Link>
      )}

      {/* Header content */}
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        {/* Title */}
        <div className="min-w-0">
          <h1
            className="
              text-2xl
              font-semibold
              tracking-[-0.02em]
              text-[#0f172a]
              sm:text-3xl
            "
          >
            {title}
          </h1>

          {description && (
            <p
              className="
                mt-1.5
                max-w-2xl
                text-sm
                leading-5
                text-[#64748b]
                sm:text-base
              "
            >
              {description}
            </p>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="flex shrink-0 items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRight() {
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
      className="shrink-0 text-[#64748b]"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}