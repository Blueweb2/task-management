"use client";

import { useState } from "react";
import {
  Edit3,
  Power,
  Tag,
} from "lucide-react";

import type { Service } from "@/types/service";
import { getServiceImageUrl } from "@/lib/services.api";

type ServiceCardProps = {
  service: Service;
  onEdit: (service: Service) => void;
  onDeactivate: (service: Service) => void;
};

const pricingLabels: Record<string, string> = {
  FIXED: "Fixed Price",
  PER_GUEST: "Per Guest",
  PER_UNIT: "Per Unit",
  PER_HOUR: "Per Hour",
  PER_DAY: "Per Day",
  PER_STAFF: "Per Staff",
  PER_REEL: "Per Reel",
};

export default function ServiceCard({
  service,
  onEdit,
  onDeactivate,
}: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);

  const pricingLabel =
    pricingLabels[service.pricingType] ||
    service.pricingType;

  const formattedPrice =
    Number(service.basePrice || 0).toLocaleString(
      "en-IN",
    );

  const imageUrl = getServiceImageUrl(service.imageUrl);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E6E7EA] bg-[#ffffff] p-5 shadow-xs transition duration-200 hover:shadow-md">
      {/* Service Image / Category Banner */}
      <div className="relative -mx-5 -mt-5 mb-4 flex h-36 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8F9FA] to-[#EAECEF]">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-[#96979A]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-xs">
              <Tag size={18} strokeWidth={2} className="text-[#64748b]" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
              {service.category}
            </span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h3
              className="truncate text-base font-semibold text-[#475569]"
              title={service.name}
            >
              {service.name}
            </h3>

            <span
              className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                service.active
                  ? "bg-[#eff6ff] text-[#475569]"
                  : "bg-[#eff6ff] text-[#96979A]"
              }`}
            >
              {service.active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Category */}
          <div className="mt-2.5 flex items-center gap-2 text-xs text-[#64748b]">
            <Tag size={13} strokeWidth={2} />

            <span className="capitalize">
              {service.category}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-all duration-200 hover:bg-[#eff6ff] hover:text-[#475569] active:scale-95"
            aria-label={`Edit ${service.name}`}
          >
            <Edit3 size={16} strokeWidth={2} />
          </button>

          {service.active && (
            <button
              type="button"
              onClick={() => onDeactivate(service)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-all duration-200 hover:bg-[#eff6ff] hover:text-[#475569] active:scale-95"
              aria-label={`Deactivate ${service.name}`}
            >
              <Power size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-3 min-h-[40px]">
        {service.description ? (
          <p
            className="line-clamp-2 text-sm leading-5 text-[#64748b]"
            title={service.description}
          >
            {service.description}
          </p>
        ) : (
          <p className="text-xs italic leading-5 text-[#B0B2B6]">
            No description provided
          </p>
        )}
      </div>

      {/* Bottom section pinned to bottom */}
      <div className="mt-auto space-y-4 pt-4">
        {/* Pricing */}
        <div className="rounded-xl bg-[#eff6ff] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Pricing
          </p>

          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-semibold tracking-tight text-[#475569]">
              ₹{formattedPrice}
            </span>

            {service.pricingType !== "FIXED" && (
              <span className="text-xs text-[#64748b]">
                / {service.unitLabel || "unit"}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[#64748b]">
            {pricingLabel}
          </p>
        </div>

        {/* Options */}
        <div className="flex h-7 items-center justify-between border-t border-[#ECEDEF] pt-4">
          <span className="text-xs font-medium text-[#64748b]">
            {service.options?.length || 0}{" "}
            {service.options?.length === 1
              ? "option"
              : "options"}
          </span>

          {service.options &&
            service.options.length > 0 && (
              <div className="flex -space-x-1.5">
                {service.options
                  .slice(0, 3)
                  .map((option, index) => (
                    <span
                      key={option._id || index}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#ffffff] bg-[#475569] text-[9px] font-semibold text-white"
                      title={option.name}
                    >
                      {option.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  ))}

                {service.options.length > 3 && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#ffffff] bg-[#eff6ff] text-[9px] font-semibold text-[#475569]">
                    +{service.options.length - 3}
                  </span>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}