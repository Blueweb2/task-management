"use client";

import {
  Compass,
  HelpCircle,
  Mail,
  MapPin,
  Megaphone,
  PartyPopper,
  Phone,
  Search,
  Share2,
  User,
  Users,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import type { BookingFormData } from "../types";

type ClientDetailsStepProps = {
  formData: BookingFormData;
  updateField: <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) => void;
};

const REFERRAL_OPTIONS = [
  {
    id: "Social Media",
    label: "Social Media",
    subLabel: "Instagram, Facebook, TikTok",
    icon: Share2,
  },
  {
    id: "Friend / Referral",
    label: "Friend / Family",
    subLabel: "Word of mouth recommendation",
    icon: Users,
  },
 
  {
    id: "Past Event",
    label: "Past Event",
    subLabel: "Attended a previous event",
    icon: PartyPopper,
  },
 
];

export default function ClientDetailsStep({
  formData,
  updateField,
}: ClientDetailsStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* CONTACT INFORMATION CARD */}
      <div className="rounded-3xl border border-[#dbeafe] bg-white p-5 sm:p-8 shadow-xs">
        {/* Section Heading */}
        <div className="mb-6 flex items-start gap-3 border-b border-[#eff6ff] pb-5">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[#0f172a] text-white shrink-0 shadow-xs">
            <UserCheck size={18} className="text-[#60a5fa]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0f172a]">
              Client Information
            </h2>
            <p className="mt-0.5 text-xs text-[#475569]">
              Enter client contact details for booking confirmation, estimates, and billing.
            </p>
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* FULL NAME */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#0f172a]"
            >
              Full Name <span className="text-[#3b82f6]">*</span>
            </label>

            <div className="relative">
              <User
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"
              />

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Enter client's full name"
                required
                className="h-12 w-full rounded-2xl border border-[#dbeafe] bg-white pl-11 pr-4 text-sm text-[#0f172a] outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 shadow-2xs"
              />
            </div>
          </div>

          {/* PHONE NUMBER */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#0f172a]"
            >
              Phone Number <span className="text-[#3b82f6]">*</span>
            </label>

            <div className="relative">
              <Phone
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"
              />

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="+91 98765 43210"
                required
                className="h-12 w-full rounded-2xl border border-[#dbeafe] bg-white pl-11 pr-4 text-sm text-[#0f172a] outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 shadow-2xs"
              />
            </div>
          </div>

          {/* EMAIL ADDRESS */}
          <div className="sm:col-span-2">
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#0f172a]"
            >
              Email Address <span className="text-[#3b82f6]">*</span>
            </label>

            <div className="relative">
              <Mail
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"
              />

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder="name@example.com"
                required
                className="h-12 w-full rounded-2xl border border-[#dbeafe] bg-white pl-11 pr-4 text-sm text-[#0f172a] outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 shadow-2xs"
              />
            </div>
          </div>

          {/* EVENT VENUE / ADDRESS */}
          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#0f172a]"
            >
              Event Address Details
            </label>

            <div className="relative">
              <MapPin
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-3.5 top-4 text-[#64748b]"
              />

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                placeholder="Complete street address or venue landmarks..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-[#dbeafe] bg-white py-3 pl-11 pr-4 text-sm text-[#0f172a] outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* REFERRAL SOURCE */}
      <div className="rounded-3xl border border-[#dbeafe] bg-white p-5 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Compass size={18} className="text-[#2563eb]" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
              Lead / Inquiry Source
            </h3>
            <p className="text-xs text-[#475569]">
              Record how this client reached out or discovered our event management services.
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {REFERRAL_OPTIONS.map((source) => {
            const Icon = source.icon;
            const isSelected = formData.referralSource === source.id;

            return (
              <button
                type="button"
                key={source.id}
                onClick={() => updateField("referralSource", source.id)}
                className={`flex flex-col items-start rounded-2xl border p-3 sm:p-4 text-left transition-all cursor-pointer active:scale-98 ${
                  isSelected
                    ? "border-[#2563eb] bg-[#f8fbff] text-[#0f172a] ring-2 ring-[#2563eb]/30 shadow-xs"
                    : "border-[#dbeafe] bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-[#0f172a] text-[#60a5fa]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon size={16} />
                  </span>

                  <input
                    type="radio"
                    name="referralSource"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-4 w-4 text-[#2563eb] focus:ring-[#2563eb]"
                  />
                </div>

                <p className="mt-2.5 text-xs font-bold text-[#0f172a]">
                  {source.label}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-500 line-clamp-1">
                  {source.subLabel}
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom text field if 'Friend / Referral', 'Social Media', or 'Other' is selected */}
        {(formData.referralSource === "Friend / Referral" ||
          formData.referralSource === "Social Media" ||
          formData.referralSource === "Other") && (
          <div className="mt-4 animate-in fade-in transition-all">
            <label
              htmlFor="customReferral"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700"
            >
              <UserCheck size={14} className="text-[#2563eb]" />
              {formData.referralSource === "Friend / Referral"
                ? "Which friend or family member referred you? (Mention their name)"
                : formData.referralSource === "Social Media"
                ? "Please specify which platform (Instagram, Facebook, LinkedIn...):"
                : "Please specify your referral source:"}
            </label>
            <input
              id="customReferral"
              type="text"
              placeholder={
                formData.referralSource === "Friend / Referral"
                  ? "e.g. Rahul Sharma, Priya Mehta, Uncle Verma..."
                  : formData.referralSource === "Social Media"
                  ? "e.g. Instagram @handle, viral reel, LinkedIn..."
                  : "e.g. Corporate event, magazine, wedding expo..."
              }
              value={formData.customReferral || ""}
              onChange={(event) =>
                updateField("customReferral", event.target.value)
              }
              className="h-12 w-full rounded-2xl border border-[#dbeafe] bg-white px-4 text-sm text-[#0f172a] outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* PRIVACY / CONTACT NOTE */}
      <div className="flex items-center gap-2 rounded-2xl border border-[#dbeafe] bg-[#f8fbff] px-4 py-3 text-xs text-[#475569]">
        <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
        <span>Client profile will be saved to your Client CRM for estimates, invoices, and future event coordination.</span>
      </div>
    </div>
  );
}