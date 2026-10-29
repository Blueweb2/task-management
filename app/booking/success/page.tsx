"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  CheckCircle2,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowLeft,
  FileText,
  Sparkles,
} from "lucide-react";
import { formatTime24to12 } from "@/lib/time-utils";

// ==========================================
// Types
// ==========================================

interface SuccessDetail {
  icon: React.ElementType;
  label: string;
  value: string;
}

// ==========================================
// Detail Pill
// ==========================================

function DetailPill({
  icon: Icon,
  label,
  value,
}: SuccessDetail) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#dbeafe] bg-white/70 px-4 py-3 backdrop-blur-sm">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1e3a8a]">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[#0f172a]">
          {value}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// Step Badge
// ==========================================

function StepBadge({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold text-white">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0f172a]">
          {title}
        </p>
        <p className="mt-0.5 text-sm text-[#64748b]">
          {description}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// Success Content (reads search params)
// ==========================================

function SuccessContent() {
  const params = useSearchParams();

  // ========================================
  // Parse data from URL params
  // ========================================

  const estimateNumber = params.get("ref") || "";
  const eventName = params.get("event") || "Your Event";
  const eventDate = params.get("date") || "";
  const guests = params.get("guests") || "";
  const location = params.get("location") || "";
  const eventTime = params.get("time") || "";
  const clientName = params.get("name") || "";
  const clientEmail = params.get("email") || "";
  const clientPhone = params.get("phone") || "";
  const total = params.get("total") || "";

  // ========================================
  // Format date nicely
  // ========================================

  const formattedDate = eventDate
    ? (() => {
        try {
          return new Date(eventDate).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        } catch {
          return eventDate;
        }
      })()
    : "";

  // ========================================
  // Format total
  // ========================================

  const formattedTotal = total
    ? `₹${Number(total).toLocaleString("en-IN")}`
    : "";

  // ========================================
  // Build event details list
  // ========================================

  const eventDetails: SuccessDetail[] = [
    ...(formattedDate
      ? [{ icon: CalendarDays, label: "Date", value: formattedDate }]
      : []),
    ...(eventTime
      ? [{ icon: Clock, label: "Time", value: formatTime24to12(eventTime) }]
      : []),
    ...(guests
      ? [{ icon: Users, label: "Guests", value: `${guests} guests` }]
      : []),
    ...(location
      ? [{ icon: MapPin, label: "Venue", value: location }]
      : []),
  ];

  const contactDetails: SuccessDetail[] = [
    ...(clientName
      ? [{ icon: Users, label: "Name", value: clientName }]
      : []),
    ...(clientEmail
      ? [{ icon: Mail, label: "Email", value: clientEmail }]
      : []),
    ...(clientPhone
      ? [{ icon: Phone, label: "Phone", value: clientPhone }]
      : []),
  ];

  return (
    <main className="min-h-screen bg-[#f8fbff]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">

        {/* ======================================
            Header — Back Link
        ====================================== */}

        <div className="mb-8">
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563eb] transition hover:text-[#1e3a8a]"
          >
            <ArrowLeft size={13} />
            Back to Booking
          </Link>
        </div>

        {/* ======================================
            Success Icon + Headline
        ====================================== */}

        <div className="text-center">
          {/* Animated checkmark ring */}
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#eff6ff] opacity-60" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#eff6ff]">
              <CheckCircle2
                size={48}
                strokeWidth={1.5}
                className="text-[#1e3a8a]"
              />
            </div>
          </div>

          <div className="mb-2 flex items-center justify-center gap-2">
            <Sparkles
              size={16}
              className="text-[#3b82f6]"
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
              Estimate Submitted
            </span>
            <Sparkles
              size={16}
              className="text-[#3b82f6]"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            You&apos;re all set!
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#64748b]">
            Your estimate request for{" "}
            <span className="font-semibold text-[#0f172a]">
              {eventName}
            </span>{" "}
            has been submitted successfully. Our team will review it and get back to you shortly.
          </p>

          {/* Reference number */}
          {estimateNumber && (
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white px-4 py-2 shadow-sm">
              <FileText
                size={14}
                className="text-[#2563eb]"
              />
              <span className="text-xs font-medium text-[#64748b]">
                Reference:
              </span>
              <span className="font-mono text-sm font-bold text-[#0f172a]">
                {estimateNumber}
              </span>
            </div>
          )}

          {/* Estimated total */}
          {formattedTotal && (
            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#ffffff] px-4 py-2">
              <span className="text-xs font-medium text-[#64748b]">
                Estimate Total:
              </span>
              <span className="text-sm font-bold text-[#0f172a]">
                {formattedTotal}
              </span>
            </div>
          )}
        </div>

        {/* ======================================
            Event Details Card
        ====================================== */}

        {eventDetails.length > 0 && (
          <div className="mt-10 rounded-3xl border border-[#dbeafe] bg-[#ffffff] p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Event Summary
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {eventDetails.map((detail) => (
                <DetailPill
                  key={detail.label}
                  icon={detail.icon}
                  label={detail.label}
                  value={detail.value}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================
            Contact Details Card
        ====================================== */}

        {contactDetails.length > 0 && (
          <div className="mt-4 rounded-3xl border border-[#dbeafe] bg-[#ffffff] p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Your Contact Info
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {contactDetails.map((detail) => (
                <DetailPill
                  key={detail.label}
                  icon={detail.icon}
                  label={detail.label}
                  value={detail.value}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================
            What Happens Next
        ====================================== */}

        <div className="mt-6 rounded-3xl border border-[#dbeafe] bg-[#ffffff] p-6">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
            What happens next
          </p>

          <div className="space-y-5">
            <StepBadge
              step={1}
              title="Estimate Review"
              description="Our team will review your estimate request within 24–48 hours."
            />
            <div className="ml-4 h-px bg-[#dbeafe]" />
            <StepBadge
              step={2}
              title="We'll Reach Out"
              description="A team member will contact you on the phone or email you provided to discuss details."
            />
            <div className="ml-4 h-px bg-[#dbeafe]" />
            <StepBadge
              step={3}
              title="Finalise & Confirm"
              description="Once both parties agree, we'll finalise the booking and confirm your event date."
            />
          </div>
        </div>

        {/* ======================================
            CTA Buttons
        ====================================== */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/manager/events?tab=estimates"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-[#1e3a8a] px-8 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#363d2e] hover:shadow-lg active:scale-[0.99]"
          >
            View Proposals & Estimates
          </Link>

          <Link
            href="/manager/booking"
            className="flex min-h-12 items-center justify-center rounded-2xl border border-[#dbeafe] bg-white px-8 text-sm font-semibold text-[#0f172a] transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          >
            Create Another Booking
          </Link>

          <Link
            href="/manager"
            className="flex min-h-12 items-center justify-center rounded-2xl border border-[#dbeafe] bg-[#f8fbff] px-6 text-sm font-semibold text-[#475569] transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.99]"
          >
            Manager Portal
          </Link>
        </div>

        {/* ======================================
            Footer note
        ====================================== */}

        <p className="mt-8 text-center text-xs text-[#64748b]">
          Keep your reference number safe. You&apos;ll need it if you contact us about this estimate.
        </p>
      </div>
    </main>
  );
}

// ==========================================
// Page (wrapped in Suspense for useSearchParams)
// ==========================================

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8fbff]">
          <div className="text-sm text-[#64748b]">
            Loading...
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
