import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StaffEventsHeader() {
  return (
    <div className="border-b border-[#dbeafe] pb-6">
      <Link
        href="/staff"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d4ed8] transition hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">My Events</h1>
      <p className="mt-1 text-sm text-[#475569]">
        All events you are assigned to work as part of the staff team.
      </p>
    </div>
  );
}
