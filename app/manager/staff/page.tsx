"use client";

import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";

import StaffDirectoryTab from "@/components/manager/staff/StaffDirectoryTab";

function ManagerStaffContent() {
  return (
    <main className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2563eb]/15 text-[#2563eb]">
            <Sparkles size={13} />
          </span>

          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
            Staff Management Hub
          </p>
        </div>

        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
          Staff Members
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          Manage your staff directory and staff member details.
        </p>
      </div>

      {/* Staff Directory Only */}
      <StaffDirectoryTab />
    </main>
  );
}

export default function ManagerStaffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>

          <p className="text-xs font-medium text-gray-500">
            Loading Staff Management Hub...
          </p>
        </div>
      }
    >
      <ManagerStaffContent />
    </Suspense>
  );
}