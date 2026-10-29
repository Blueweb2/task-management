"use client";

import { Search, SlidersHorizontal, X, User } from "lucide-react";

import {
  expenseCategories,
  expenseStatuses,
  paymentMethods,
  type ExpenseCreator,
  type ExpenseStatus,
  type PaymentMethod,
} from "./constants";

interface ExpensesFiltersProps {
  search: string;
  category: string;
  addedBy: string;
  creators?: ExpenseCreator[];
  startDate?: string;
  endDate?: string;
  paymentMethod: PaymentMethod | "All";
  status: ExpenseStatus | "All";
  eventFilter?: string;
  eventOptions?: { id: string; name: string }[];
  showEventFilter?: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddedByChange: (value: string) => void;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod | "All") => void;
  onStatusChange: (value: ExpenseStatus | "All") => void;
  onEventFilterChange?: (value: string) => void;
  onClear: () => void;
}

export default function ExpensesFilters({
  search,
  category,
  addedBy,
  creators = [],
  paymentMethod,
  status,
  eventFilter = "All",
  eventOptions = [],
  showEventFilter = true,
  onSearchChange,
  onCategoryChange,
  onAddedByChange,
  onPaymentMethodChange,
  onStatusChange,
  onEventFilterChange,
  onClear,
}: ExpensesFiltersProps) {
  const hasFilters =
    Boolean(search) ||
    (category !== "All" && category !== "All Categories") ||
    (addedBy !== "All" && addedBy !== "All Staff") ||
    paymentMethod !== "All" ||
    status !== "All" ||
    (showEventFilter && eventFilter && eventFilter !== "All");

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white p-4 shadow-xs sm:p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#1d4ed8]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e293b]">
            Department & Staff Filters
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d4ed8] hover:text-[#7d5428] transition"
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Primary Row: Search, Category, Added By (Staff) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by description or vendor name..."
            className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] pl-9 pr-3 text-xs text-[#0f172a] outline-none transition placeholder:text-[#aaa198] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
          />
        </div>

        {/* Filter B: Department / Category */}
        <div className="relative">
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="Filter by department or category"
            className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
          >
            <option value="All">All Categories</option>
            {expenseCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Filter A: Staff (Added By) */}
        <div className="relative">
          <select
            value={addedBy}
            onChange={(event) => onAddedByChange(event.target.value)}
            aria-label="Filter by staff or manager who added"
            className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
          >
            <option value="All">All Staff</option>
            {creators.map((user) => {
              const id = user._id || user.id || "";
              const label = `${user.name || user.username}${user.role ? ` (${user.role.toUpperCase()})` : ""}`;
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Secondary Row: (optional Event), Payment Method & Status */}
      <div
        className={`mt-3 grid gap-3 sm:grid-cols-2 ${
          showEventFilter && eventOptions.length > 0
            ? "lg:grid-cols-3"
            : "lg:grid-cols-2"
        }`}
      >
        {/* Optional Event Filter (shown only when showEventFilter is true) */}
        {showEventFilter && eventOptions.length > 0 && (
          <select
            value={eventFilter}
            onChange={(event) => onEventFilterChange?.(event.target.value)}
            aria-label="Filter by event"
            className="h-10 rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
          >
            <option value="All">All Events</option>
            {eventOptions.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name}
              </option>
            ))}
          </select>
        )}

        {/* Payment Method */}
        <select
          value={paymentMethod}
          onChange={(event) =>
            onPaymentMethodChange(event.target.value as PaymentMethod | "All")
          }
          aria-label="Filter by payment method"
          className="h-10 rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
        >
          <option value="All">All Methods</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        {/* Payment Status */}
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as ExpenseStatus | "All")
          }
          aria-label="Filter by status"
          className="h-10 rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
        >
          <option value="All">All Status</option>
          {expenseStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}