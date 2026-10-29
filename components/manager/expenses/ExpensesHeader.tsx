"use client";

import { Plus, ReceiptText } from "lucide-react";

interface ExpensesHeaderProps {
  onAddExpense: () => void;
}

export default function ExpensesHeader({
  onAddExpense,
}: ExpensesHeaderProps) {
  return (
    <header className="border-b border-[#eff6ff] pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />

            <p className="text-sm font-semibold text-[#1d4ed8]">
              Expense Management
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <ReceiptText
              size={24}
              className="text-[#475569]"
            />

            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
              Expenses
            </h1>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Track event expenses, payments, and outstanding amounts.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddExpense}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30"
        >
          <Plus size={17} />
          Add Expense
        </button>
      </div>
    </header>
  );
}