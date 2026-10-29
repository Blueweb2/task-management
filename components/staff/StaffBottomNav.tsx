"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListTodo,
  Package,
  Clock3,
  User,
  Menu,
} from "lucide-react";

interface StaffBottomNavProps {
  onMore?: () => void;
}

export default function StaffBottomNav({ onMore }: StaffBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Tasks", href: "/staff", icon: ListTodo },
    { label: "Stock", href: "/staff/stock", icon: Package },
    { label: "Attendance", href: "/staff/attendance", icon: Clock3 },
    { label: "Profile", href: "/staff/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dbeafe] bg-white/95 backdrop-blur-md px-2 py-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] sm:px-6 lg:hidden shadow-lg">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1 text-[10px] sm:text-[11px] font-bold transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-[#1d4ed8]"
                  : "text-gray-400 hover:text-gray-800"
              }`}
            >
              {isActive && (
                <span className="absolute inset-x-2 inset-y-0.5 rounded-2xl bg-[#1d4ed8]/10 -z-10 animate-fade-in" />
              )}
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {onMore && (
          <button
            type="button"
            onClick={onMore}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1 text-[10px] sm:text-[11px] font-bold text-gray-400 hover:text-gray-800 transition active:scale-95 cursor-pointer"
          >
            <Menu size={19} />
            <span>More</span>
          </button>
        )}
      </div>
    </nav>
  );
}
