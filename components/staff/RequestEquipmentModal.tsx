"use client";

import { useState, useEffect } from "react";
import { X, Package, AlertCircle, Loader2, Send } from "lucide-react";
import { createEquipmentRequest } from "@/lib/equipmentRequest.api";
import { getStockItems } from "@/lib/stock.api";
import type { Task } from "@/types/task";

interface RequestEquipmentModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onRequestSubmitted?: () => void;
  token: string;
}

export default function RequestEquipmentModal({
  isOpen,
  task,
  onClose,
  onRequestSubmitted,
  token,
}: RequestEquipmentModalProps) {
  const [stockCatalog, setStockCatalog] = useState<any[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !token) return;

    setCatalogLoading(true);
    setError(null);
    setSuccess(false);

    getStockItems(token, { limit: 100 })
      .then((res: any) => {
        const items = res.items || res.data || [];
        setStockCatalog(items);
        if (items.length > 0) {
          setSelectedStockId(items[0]._id);
        }
      })
      .catch((err) => {
        console.warn("Could not load stock catalog:", err);
      })
      .finally(() => {
        setCatalogLoading(false);
      });
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockId) {
      setError("Please select an equipment item.");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createEquipmentRequest(
        {
          task: task?._id || null,
          stockItem: selectedStockId,
          requestedQuantity: quantity,
          reason: reason.trim(),
        },
        token
      );

      setSuccess(true);
      setTimeout(() => {
        if (onRequestSubmitted) onRequestSubmitted();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Equipment request error:", err);
      setError(err.message || "Failed to submit equipment request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-[#2563eb]">
              <Package size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Request Equipment</h3>
              <p className="text-[11px] text-gray-500">
                {task ? `For: ${task.title}` : "Request tools or gear from manager"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Package size={24} />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Request Submitted!</h4>
            <p className="text-xs text-gray-500">
              Your equipment request has been sent to the manager for approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Equipment Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Equipment Item <span className="text-red-500">*</span>
              </label>
              {catalogLoading ? (
                <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
                  <Loader2 size={14} className="animate-spin text-[#2563eb]" />
                  <span>Loading catalog...</span>
                </div>
              ) : (
                <select
                  required
                  value={selectedStockId}
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#2563eb] outline-none bg-white cursor-pointer"
                >
                  {stockCatalog.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.availableQuantity} available)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Required Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#2563eb] outline-none"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reason / Note for Manager
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this equipment is needed..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#2563eb] outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
