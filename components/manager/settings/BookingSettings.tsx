"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "manager_booking_settings";

export default function BookingSettings() {
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [allowPendingBookings, setAllowPendingBookings] = useState(true);
  const [allowPastDates, setAllowPastDates] = useState(false);
  const [minimumGuests, setMinimumGuests] = useState("10");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.requireConfirmation === "boolean") setRequireConfirmation(parsed.requireConfirmation);
        if (typeof parsed.allowPendingBookings === "boolean") setAllowPendingBookings(parsed.allowPendingBookings);
        if (typeof parsed.allowPastDates === "boolean") setAllowPastDates(parsed.allowPastDates);
        if (parsed.minimumGuests) setMinimumGuests(String(parsed.minimumGuests));
      }
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          requireConfirmation,
          allowPendingBookings,
          allowPastDates,
          minimumGuests: Number(minimumGuests) || 10,
        })
      );
      setMessage("Booking rules saved successfully.");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("Failed to save booking rules.");
    }
  };

  const options = [
    {
      label: "Require Booking Confirmation",
      description:
        "New bookings remain pending until a manager confirms them.",
      value: requireConfirmation,
      setValue: setRequireConfirmation,
    },
    {
      label: "Allow Pending Bookings",
      description:
        "Allow bookings to be saved without immediate confirmation.",
      value: allowPendingBookings,
      setValue: setAllowPendingBookings,
    },
    {
      label: "Allow Past Event Dates",
      description:
        "Allow staff to create bookings for dates that have already passed.",
      value: allowPastDates,
      setValue: setAllowPastDates,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white shadow-sm">
      <div className="border-b border-[#eff6ff] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1d4ed8]">
            <CalendarCheck size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#0f172a]">
              Booking Settings
            </h2>

            <p className="text-sm text-[#64748b]">
              Configure how customer and staff bookings should be validated.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#eff6ff]">
        {options.map((option) => (
          <div
            key={option.label}
            className="flex items-center justify-between gap-4 p-5 sm:p-6"
          >
            <div>
              <p className="text-sm font-semibold text-[#1e293b]">
                {option.label}
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-[#64748b]">
                {option.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={option.value}
              onClick={() =>
                option.setValue(!option.value)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                option.value
                  ? "bg-[#3b82f6]"
                  : "bg-[#dbeafe]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  option.value
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        ))}

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1e293b]">
              Minimum Guests Per Booking
            </label>

            <p className="mb-3 text-xs text-[#64748b]">
              Set the minimum number of guests required to submit a booking proposal.
            </p>

            <input
              type="number"
              min="1"
              value={minimumGuests}
              onChange={(e) =>
                setMinimumGuests(e.target.value)
              }
              className="h-11 w-full max-w-xs rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-sm outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition"
            >
              Save Booking Settings
            </button>

            {message && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#557555]">
                <CheckCircle2 size={15} />
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}