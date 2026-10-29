"use client";

import { ClipboardList } from "lucide-react";

import type { Duty } from "./constants";
import DutyCard from "./DutyCard";

interface DutiesListProps {
  duties: Duty[];
  loading?: boolean;
  onEdit: (duty: Duty) => void;
  onDelete: (duty: Duty) => void;
  onStatusChange: (duty: Duty) => void;
  onToggleChecklist?: (dutyId: string, updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>) => void;
  onManageChecklist?: (duty: Duty) => void;
}

export default function DutiesList({
  duties,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleChecklist,
  onManageChecklist,
}: DutiesListProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#0f172a]">
          Event Duties
        </h2>

        <p className="mt-1 text-xs text-[#64748b]">
          {duties.length}{" "}
          {duties.length === 1 ? "duty" : "duties"} found
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#dbeafe] bg-white px-6 py-14 text-center text-sm text-[#64748b]">Loading duties...</div>
      ) : duties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dbeafe] bg-[#ffffff] px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#1d4ed8]">
            <ClipboardList size={21} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#0f172a]">
            No duties found
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#64748b]">
            Try changing your filters or create a new duty.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {duties.map((duty) => (
            <DutyCard
              key={duty.id}
              duty={duty}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onToggleChecklist={onToggleChecklist}
              onManageChecklist={onManageChecklist}
            />
          ))}
        </div>
      )}
    </section>
  );
}
