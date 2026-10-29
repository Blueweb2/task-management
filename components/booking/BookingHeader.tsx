"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

interface BookingHeaderProps {
  onVoiceClick?: () => void;
}

export default function BookingHeader({ onVoiceClick }: BookingHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link
          href="/manager"
          className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-[#dbeafe] bg-[#f8fbff] text-[#0f172a] hover:bg-[#eee8de] active:scale-95 transition shadow-2xs shrink-0"
          title="Return to Manager Dashboard"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-[#0f172a]">
              Book an Event
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#3b82f6]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#1d4ed8] uppercase tracking-wider">
              <Sparkles size={11} /> Auto Fill Ready
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#475569]">
            Fill in event, customer, food, and service details.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (onVoiceClick) onVoiceClick();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-ai-booking-assistant"));
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-2xl bg-[#0f172a] border border-[#3b82f6]/40 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:border-[#3b82f6] hover:bg-[#0f172a] active:scale-95 transition cursor-pointer"
        title="Open AI Booking Helper"
      >
        <Sparkles size={13} className="text-[#FFE58F]" />
        <span>AI Helper</span>
      </button>
    </div>
  );
}