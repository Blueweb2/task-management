import { Settings } from "lucide-react";

export default function SettingsHeader() {
  return (
    <header className="border-b border-[#eff6ff] pb-6">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />

        <p className="text-sm font-semibold text-[#1d4ed8]">
          Account Management
        </p>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Settings
          size={25}
          className="text-[#475569]"
        />

        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
          Settings
        </h1>
      </div>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
        Manage your profile, business information, notifications,
        booking preferences, and security.
      </p>
    </header>
  );
}