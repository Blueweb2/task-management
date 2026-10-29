"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateMyProfile } from "@/lib/user.api";

export default function ProfileSettings() {
  const { user, token, setAuth } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!token || !(name || user?.name || "").trim()) return;

    try {
      setSaving(true);
      const updatedUser = await updateMyProfile(
        {
          name: (name || user?.name || "").trim(),
          phone: (phone || user?.phone || "").trim(),
          location: (location || user?.location || "").trim(),
        },
        token,
      );
      setAuth(token, updatedUser);
      setName(updatedUser.name);
      setPhone(updatedUser.phone || "");
      setLocation(updatedUser.location || "");
      setMessage("Profile saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white shadow-sm">
      <div className="border-b border-[#eff6ff] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1d4ed8]">
            <User size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#0f172a]">
              Profile
            </h2>

            <p className="text-sm text-[#64748b]">
              Manage your personal account information.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#1e293b]">
            Full Name
          </label>

          <input
            value={name || user?.name || ""}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="h-11 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-sm text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#1e293b]">
            Email Address
          </label>

          <input
            value={user?.email || ""}
            type="email"
            className="h-11 w-full rounded-xl border border-[#dbeafe] bg-[#f3f0eb] px-3 text-sm text-[#475569] outline-none"
            disabled
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#1e293b]">
            Phone Number
          </label>

          <input
            value={phone || user?.phone || ""}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="h-11 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-sm text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#1e293b]">Location</label>
          <input value={location || user?.location || ""} onChange={(e) => setLocation(e.target.value)} type="text" className="h-11 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-sm text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10" />
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {message && <p role="status" className="text-xs font-medium text-[#557555]">{message}</p>}
      </div>
    </section>
  );
}