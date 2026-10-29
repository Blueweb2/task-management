"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  dutyStatuses,
  type DutyStatus,
} from "./constants";

interface DutiesFiltersProps {
  search: string;
  status: "All" | DutyStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "All" | DutyStatus) => void;
  onClear: () => void;
}

export default function DutiesFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: DutiesFiltersProps) {
  const hasFilters =
    search.trim() !== "" || status !== "All";

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1d4ed8]">
            <SlidersHorizontal size={16} />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-[#0f172a]">
              Duty Filters
            </h2>

            <p className="hidden text-xs text-[#64748b] sm:block">
              Find duties quickly
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d4ed8] transition hover:text-[#475569]"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search duty, event or staff..."
            className="h-11 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] pl-10 pr-4 text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            onStatusChange(
              e.target.value as "All" | DutyStatus
            )
          }
          className="h-11 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-sm text-[#1e293b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
        >
          <option value="All">All Statuses</option>

          {dutyStatuses.map((item) => {
            const labels: Record<string, string> = {
              ASSIGNED: "Assigned (Pending Confirmation)",
              ACCEPTED: "Confirmed by Staff",
              REJECTED: "Declined by Staff (Needs Reassignment)",
              IN_PROGRESS: "In Progress",
              COMPLETED: "Completed",
              CANCELLED: "Cancelled",
            };
            return (
              <option key={item} value={item}>
                {labels[item] || item}
              </option>
            );
          })}
        </select>
      </div>
    </section>
  );
}