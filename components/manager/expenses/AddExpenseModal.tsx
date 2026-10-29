"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Upload,
  FileText,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Receipt,
  User,
  Lock,
} from "lucide-react";

import {
  expenseCategories,
  paymentMethods,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type PaymentMethod,
} from "./constants";
import { useAuth } from "@/hooks/useAuth";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    expense: Expense,
    receiptFile: File | null,
    removeReceipt?: boolean
  ) => Promise<void>;
  editingExpense?: Expense | null;
  events?: { id: string; name: string }[];
  fixedEvent?: { id: string; name: string };
}

const emptyExpense: Expense = {
  id: "",
  title: "",
  category: "Staff",
  amount: 0,
  event: "",
  eventId: "",
  date: new Date().toISOString().split("T")[0],
  paymentMethod: "UPI",
  status: "Paid",
  description: "",
  vendorName: "",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export default function AddExpenseModal({
  open,
  onClose,
  onSave,
  editingExpense,
  events = [],
  fixedEvent,
}: AddExpenseModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<Expense>(emptyExpense);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Receipt state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [removeExistingReceipt, setRemoveExistingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addedByDisplay = editingExpense
    ? (editingExpense.createdByName ||
        (typeof editingExpense.createdBy === "object"
          ? editingExpense.createdBy?.name || editingExpense.createdBy?.username
          : "") ||
        user?.name ||
        user?.username ||
        "Staff / Manager")
    : user
    ? `${user.name || user.username}${user.role ? ` (${user.role.toUpperCase()})` : ""}`
    : "Authenticated Staff";

  useEffect(() => {
    if (editingExpense) {
      setForm({
        ...emptyExpense,
        ...editingExpense,
        event: editingExpense.event || (fixedEvent ? fixedEvent.name : ""),
        eventId: editingExpense.eventId || (fixedEvent ? fixedEvent.id : ""),
        vendorName: editingExpense.vendorName || "",
      });
      setReceiptFile(null);
      setReceiptPreview(null);
      setRemoveExistingReceipt(false);
    } else {
      setForm({
        ...emptyExpense,
        event: fixedEvent ? fixedEvent.name : "",
        eventId: fixedEvent ? fixedEvent.id : "",
        date: new Date().toISOString().split("T")[0],
      });
      setReceiptFile(null);
      setReceiptPreview(null);
      setRemoveExistingReceipt(false);
    }
    setError("");
  }, [editingExpense, open, fixedEvent]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  if (!open) return null;

  const updateField = <K extends keyof Expense>(
    field: K,
    value: Expense[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setError("Unsupported file format. Please upload JPG, PNG, WEBP, or PDF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Receipt file is too large. Maximum size allowed is 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setReceiptFile(file);
    setRemoveExistingReceipt(false);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleRemoveSelectedFile = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExisting = () => {
    setRemoveExistingReceipt(true);
    handleRemoveSelectedFile();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const rawTarget = (fixedEvent?.name || form.event || form.task || "").trim();
    const targetEventName = rawTarget || "General";
    const targetEventId = fixedEvent?.id || form.eventId;

    if (
      !form.title.trim() ||
      !form.date ||
      Number(form.amount) <= 0
    ) {
      setError("Please complete the title, valid amount, and date.");
      return;
    }

    const expense: Expense = {
      ...form,
      id:
        editingExpense?.id ||
        `EXP-${Date.now().toString().slice(-6)}`,
      title: form.title.trim(),
      event: targetEventName,
      eventId: targetEventId || undefined,
      description: form.description.trim(),
      vendorName: (form.vendorName || "").trim(),
      amount: Number(form.amount),
    };

    try {
      setSaving(true);
      setError("");
      await onSave(expense, receiptFile, removeExistingReceipt);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const hasExistingReceipt =
    Boolean(editingExpense?.hasReceipt || editingExpense?.receiptPath) &&
    !removeExistingReceipt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f172a]/45 p-0 sm:items-center sm:p-5 backdrop-blur-2xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl border border-[#dbeafe]">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eff6ff] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1d4ed8]">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">
                {editingExpense ? "Edit Expense Record" : "Add Operational Expense"}
              </h2>
              <p className="text-xs text-[#64748b]">
                Department-wise expense tracking with receipt upload.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !saving && onClose()}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#475569] hover:bg-[#eff6ff] transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 sm:mx-6"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          {/* Title & Vendor Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Expense Title / Purpose *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="e.g. Stage Sound & Mic Rental"
                className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Vendor / Supplier Name
              </label>
              <input
                type="text"
                value={form.vendorName || ""}
                onChange={(event) =>
                  updateField("vendorName", event.target.value)
                }
                placeholder="e.g. Prime Audio Rentals"
                className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
              />
            </div>
          </div>

          {/* Department / Category & Amount */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Department / Category *
              </label>
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value as ExpenseCategory)
                }
                className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                {["Food", "Equipment", "Other"].includes(form.category) && (
                  <option value={form.category}>{form.category}</option>
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                value={form.amount || ""}
                onChange={(event) =>
                  updateField("amount", Number(event.target.value))
                }
                placeholder="₹ 0"
                className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-bold text-[#0f172a] outline-none focus:border-[#3b82f6]"
                required
              />
            </div>
          </div>

          {/* Added By (Read-only Authenticated User) & Associated Event */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Added By (Authenticated User)
              </label>
              <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#dbeafe] bg-[#f8fbff]/70 px-3 text-xs font-medium text-[#0f172a]">
                <User size={14} className="text-[#1d4ed8] shrink-0" />
                <span className="truncate">{addedByDisplay}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Associated Task / Reference (Optional)
              </label>
              {fixedEvent ? (
                <div className="flex h-10 w-full items-center justify-between rounded-xl border border-[#dbeafe] bg-[#f8fbff]/70 px-3 text-xs font-semibold text-[#0f172a]">
                  <span className="truncate">{fixedEvent.name}</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#1d4ed8] shrink-0">
                    <Lock size={12} />
                    <span>Locked</span>
                  </span>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={form.eventId || (form.event ? "custom" : "")}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) {
                        setForm((curr) => ({
                          ...curr,
                          eventId: "",
                          event: "General",
                        }));
                      } else if (selectedId === "custom") {
                        updateField("eventId", "");
                      } else {
                        const matched = events.find((ev) => ev.id === selectedId);
                        if (matched) {
                          setForm((curr) => ({
                            ...curr,
                            eventId: matched.id,
                            event: matched.name,
                          }));
                        } else {
                          updateField("eventId", "");
                        }
                      }
                    }}
                    className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
                  >
                    <option value="">General (No Task / Event)</option>
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name}
                      </option>
                    ))}
                    <option value="custom">Other / Custom Name</option>
                  </select>

                  {(!form.eventId || form.eventId === "custom") && (
                    <input
                      type="text"
                      value={form.event}
                      onChange={(event) =>
                        updateField("event", event.target.value)
                      }
                      placeholder="e.g. General Operations, Task, or Project"
                      className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs outline-none focus:border-[#3b82f6]"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={form.event}
                  onChange={(event) => updateField("event", event.target.value)}
                  placeholder="e.g. General Operations or Task Title"
                  className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs outline-none focus:border-[#3b82f6]"
                />
              )}
            </div>
          </div>

          {/* Date, Payment Method & Status */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Expense Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs text-[#0f172a] outline-none focus:border-[#3b82f6]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Payment Method
              </label>
              <select
                value={form.paymentMethod}
                onChange={(event) =>
                  updateField(
                    "paymentMethod",
                    event.target.value as PaymentMethod
                  )
                }
                className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1e293b]">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as ExpenseStatus)
                }
                className="h-10 w-full rounded-xl border border-[#dbeafe] bg-[#ffffff] px-3 text-xs font-medium text-[#1e293b] outline-none focus:border-[#3b82f6]"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-bold text-[#1e293b]">
              Expense Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Short explanation of the expense, items, or department details..."
              rows={2}
              className="w-full resize-none rounded-xl border border-[#dbeafe] bg-[#ffffff] p-3 text-xs text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10"
            />
          </div>

          {/* Receipt Attachment Section */}
          <div className="rounded-2xl border border-dashed border-[#dbeafe] bg-[#f8fbff] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#1e293b] flex items-center gap-1.5">
                <FileText size={14} className="text-[#1d4ed8]" />
                <span>Receipt Attachment (Optional)</span>
              </label>
              <span className="text-[10px] text-[#64748b]">
                JPG, PNG, PDF up to 10MB
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* If there is a freshly selected file */}
            {receiptFile ? (
              <div className="flex items-center justify-between rounded-xl border border-[#dbeafe] bg-white p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {receiptPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="h-10 w-10 shrink-0 rounded-lg object-cover border border-[#eff6ff]"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-200">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0f172a] truncate">
                      {receiptFile.name}
                    </p>
                    <p className="text-[10px] text-[#64748b]">
                      {(receiptFile.size / 1024).toFixed(0)} KB • Ready to upload
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#eff6ff]"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSelectedFile}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Remove selected file"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : hasExistingReceipt ? (
              /* If editing and has existing receipt stored */
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt size={16} className="text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900 truncate">
                      {editingExpense?.receiptOriginalName || "Current receipt attached"}
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Preserved on save unless replaced or removed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveExisting}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              /* Empty attachment dropzone / button */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dbeafe] bg-white py-3 text-xs font-medium text-[#475569] hover:bg-[#eff6ff] hover:text-[#0f172a] transition"
              >
                <Upload size={14} className="text-[#1d4ed8]" />
                <span>Upload bill, receipt image, or PDF invoice</span>
              </button>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse gap-2.5 border-t border-[#eff6ff] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => !saving && onClose()}
              disabled={saving}
              className="h-10 rounded-xl border border-[#dbeafe] px-5 text-xs font-semibold text-[#1e293b] hover:bg-[#eff6ff] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              <span>
                {saving
                  ? "Saving..."
                  : editingExpense
                  ? "Save Changes"
                  : "Save Expense"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}