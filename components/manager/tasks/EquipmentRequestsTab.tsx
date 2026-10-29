"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Clock3,
  AlertCircle,
  Search,
  Loader2,
  Filter,
} from "lucide-react";
import {
  getEquipmentRequests,
  approveEquipmentRequest,
  rejectEquipmentRequest,
  issueEquipmentRequest,
  returnEquipmentRequest,
} from "@/lib/equipmentRequest.api";
import type { EquipmentRequest, EquipmentRequestStatus } from "@/types/equipmentRequest";

interface EquipmentRequestsTabProps {
  token: string;
}

export default function EquipmentRequestsTab({ token }: EquipmentRequestsTabProps) {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const loadRequests = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getEquipmentRequests(token, {
        status: statusFilter || undefined,
        limit: 100,
      });
      setRequests(res.data || []);
    } catch (err: any) {
      console.error("Load equipment requests error:", err);
      setError(err.message || "Failed to load equipment requests.");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoadingId(id);
      await approveEquipmentRequest(id, "Approved by manager", token);
      await loadRequests();
    } catch (err: any) {
      alert(err.message || "Approval failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection:") || "Stock unavailable";
    try {
      setActionLoadingId(id);
      await rejectEquipmentRequest(id, reason, "", token);
      await loadRequests();
    } catch (err: any) {
      alert(err.message || "Rejection failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleIssue = async (id: string) => {
    try {
      setActionLoadingId(id);
      await issueEquipmentRequest(id, token);
      await loadRequests();
    } catch (err: any) {
      alert(err.message || "Issue equipment failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      setActionLoadingId(id);
      await returnEquipmentRequest(id, token);
      await loadRequests();
    } catch (err: any) {
      alert(err.message || "Return equipment failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusConfig: Record<EquipmentRequestStatus, { label: string; badge: string }> = {
    PENDING: { label: "Pending", badge: "bg-amber-50 text-amber-800 border-amber-200" },
    APPROVED: { label: "Approved", badge: "bg-blue-50 text-blue-700 border-blue-200" },
    REJECTED: { label: "Rejected", badge: "bg-rose-50 text-rose-700 border-rose-200" },
    ISSUED: { label: "Issued", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    RETURNED: { label: "Returned", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "Cancelled", badge: "bg-stone-100 text-stone-600 border-stone-200" },
  };

  const filteredRequests = requests.filter((req) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const itemName = req.stockItem?.name?.toLowerCase() || "";
    const staffName = req.requestedBy?.name?.toLowerCase() || "";
    const taskTitle = req.task?.title?.toLowerCase() || "";
    return itemName.includes(term) || staffName.includes(term) || taskTitle.includes(term);
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by equipment, staff, or task..."
            className="w-full rounded-2xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-[#9A7B4F] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="ISSUED">Issued</option>
            <option value="RETURNED">Returned</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="button"
            onClick={loadRequests}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={24} className="animate-spin text-[#9A7B4F]" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <Package size={32} className="text-gray-300 mb-2" />
          <p className="text-xs font-bold text-gray-700">No equipment requests found</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Staff equipment requests for assigned tasks will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Equipment Item</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Related Task</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {filteredRequests.map((req) => {
                  const currStatus = statusConfig[req.status] || statusConfig.PENDING;
                  const isActionLoading = actionLoadingId === req._id;

                  return (
                    <tr key={req._id} className="hover:bg-stone-50/50 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-900">{req.stockItem?.name || "Equipment"}</p>
                        <p className="text-[10px] text-gray-400">
                          {req.stockItem?.category || "Tools"} • Available: {req.stockItem?.availableQuantity ?? "N/A"}
                        </p>
                        {req.reason && (
                          <p className="text-[11px] text-gray-500 italic mt-0.5">&quot;{req.reason}&quot;</p>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-bold">
                        {req.requestedQuantity} {req.stockItem?.unit || "pcs"}
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-900">{req.requestedBy?.name || "Staff"}</p>
                        <p className="text-[10px] text-gray-400">
                          {req.requestedBy?.department || req.requestedBy?.role}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        {req.task ? (
                          <p className="font-semibold text-gray-800 truncate max-w-[180px]">
                            {req.task.title}
                          </p>
                        ) : (
                          <span className="text-gray-400 italic">General</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${currStatus.badge}`}
                        >
                          {currStatus.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isActionLoading ? (
                          <Loader2 size={16} className="animate-spin text-gray-400 inline" />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(req._id)}
                                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(req._id)}
                                  className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-100 transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {req.status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => handleIssue(req._id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                              >
                                <Truck size={12} />
                                <span>Issue</span>
                              </button>
                            )}

                            {req.status === "ISSUED" && (
                              <button
                                type="button"
                                onClick={() => handleReturn(req._id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                              >
                                <RotateCcw size={12} />
                                <span>Mark Returned</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
