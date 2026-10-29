"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  MapPin,
  DollarSign,
  Check,
  Loader2,
} from "lucide-react";
import { updateTask } from "@/lib/task.api";
import { getServices } from "@/lib/services.api";
import { getStaffMembers } from "@/lib/staff.api";
import { getStockItems } from "@/lib/stock.api";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
  token: string;
}

export default function EditTaskModal({
  isOpen,
  task,
  onClose,
  onTaskUpdated,
  token,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [serviceId, setServiceId] = useState<string>("");
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [requiredEquipment, setRequiredEquipment] = useState<
    Array<{ item: string; quantity: number; notes: string }>
  >([]);
  const [estimatedExpenses, setEstimatedExpenses] = useState<string>("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [stockCatalog, setStockCatalog] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with incoming task
  useEffect(() => {
    if (!task) return;

    setTitle(task.title || "");
    setDescription(task.description || "");
    setTaskDate(task.taskDate ? task.taskDate.slice(0, 10) : "");
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setDueTime(task.dueTime || "");
    setPriority(task.priority || "MEDIUM");
    setStatus(task.status || "TODO");
    setServiceId(
      typeof task.service === "object" && task.service !== null
        ? (task.service as any)._id
        : (task.service as string) || ""
    );
    setAssignedStaffIds(
      (task.assignedStaff || []).map((s) => (typeof s === "object" ? s._id : s))
    );
    setRequiredEquipment(
      (task.requiredEquipment || []).map((eq) => ({
        item: typeof eq.item === "object" && eq.item !== null ? (eq.item as any)._id : (eq.item as string),
        quantity: eq.quantity || 1,
        notes: eq.notes || "",
      }))
    );
    setEstimatedExpenses(
      task.estimatedExpenses !== undefined ? String(task.estimatedExpenses) : ""
    );
    setLocation(task.location || "");
    setNotes(task.notes || "");
    setStatusNotes("");
    setError(null);
  }, [task]);

  // Load catalogs
  useEffect(() => {
    if (!isOpen || !token) return;

    Promise.all([
      getServices().catch(() => ({ services: [] })),
      getStaffMembers(token, { limit: 100 }).catch(() => ({ staff: [] })),
      getStockItems(token, { limit: 100 }).catch(() => ({ items: [] })),
    ]).then(([serviceRes, staffRes, stockRes]) => {
      setServices((serviceRes as any).services || (serviceRes as any).data || []);
      setStaffList((staffRes as any).staff || (staffRes as any).data || []);
      setStockCatalog((stockRes as any).items || (stockRes as any).data || []);
    });
  }, [isOpen, token]);

  if (!isOpen || !task) return null;

  const toggleStaff = (staffId: string) => {
    setAssignedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const addEquipmentRow = () => {
    const firstAvailable = stockCatalog[0]?._id || "";
    setRequiredEquipment((prev) => [
      ...prev,
      { item: firstAvailable, quantity: 1, notes: "" },
    ]);
  };

  const updateEquipmentRow = (
    index: number,
    field: "item" | "quantity" | "notes",
    value: any
  ) => {
    setRequiredEquipment((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeEquipmentRow = (index: number) => {
    setRequiredEquipment((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a task title.");
      return;
    }

    if (!dueDate) {
      setError("Please set a task due date.");
      return;
    }

    setLoading(true);

    try {
      const validEquipment = requiredEquipment
        .filter((eq) => eq.item && eq.quantity > 0)
        .map((eq) => ({
          item: eq.item,
          quantity: Number(eq.quantity),
          notes: eq.notes || "",
        }));

      const updated = await updateTask(
        task._id,
        {
          title: title.trim(),
          description: description.trim(),
          taskDate,
          dueDate,
          dueTime: dueTime.trim(),
          priority,
          status,
          service: serviceId || null,
          assignedStaff: assignedStaffIds,
          requiredEquipment: validEquipment,
          estimatedExpenses: estimatedExpenses ? Number(estimatedExpenses) : 0,
          location: location.trim(),
          notes: notes.trim(),
          statusNotes: statusNotes.trim() || undefined,
        },
        token
      );

      onTaskUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error("Update task error:", err);
      setError(err.message || "Failed to update task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4.5 bg-stone-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Task</h2>
            <p className="text-xs text-gray-500">
              Modify task information, priority, status, and staff assignment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-[#2563eb] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Description & Instructions
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#2563eb] outline-none resize-none"
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Task Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 focus:border-[#2563eb] outline-none bg-white cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 focus:border-[#2563eb] outline-none bg-white cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent ⚡</option>
              </select>
            </div>
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Task Date
              </label>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#2563eb] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#2563eb] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#2563eb] outline-none"
              />
            </div>
          </div>

          {/* Service & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Service Category
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#2563eb] outline-none bg-white"
              >
                <option value="">None / Custom</option>
                {services.map((svc) => (
                  <option key={svc._id} value={svc._id}>
                    {svc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-2 text-xs text-gray-900 focus:border-[#2563eb] outline-none"
                />
                <MapPin size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Assigned Staff */}
          <div className="rounded-2xl border border-gray-200 p-4 bg-stone-50/40 space-y-3">
            <h4 className="text-xs font-bold text-gray-900">
              Assigned Staff Members ({assignedStaffIds.length} Selected)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
              {staffList.map((st) => {
                const isSelected = assignedStaffIds.includes(st._id);
                return (
                  <button
                    key={st._id}
                    type="button"
                    onClick={() => toggleStaff(st._id)}
                    className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition active:scale-[0.98] cursor-pointer ${
                      isSelected
                        ? "border-[#2563eb] bg-[#2563eb]/10 shadow-2xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-xs font-bold text-white">
                      {st.name ? st.name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-gray-900">{st.name}</p>
                      <p className="truncate text-[10px] text-gray-500">
                        {st.department || st.role}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Required Equipment */}
          <div className="rounded-2xl border border-gray-200 p-4 bg-stone-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900">Required Equipment</h4>
              <button
                type="button"
                onClick={addEquipmentRow}
                className="inline-flex items-center gap-1 rounded-xl bg-white border border-gray-300 px-2.5 py-1 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition active:scale-95"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            {requiredEquipment.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">No equipment attached.</p>
            ) : (
              <div className="space-y-2">
                {requiredEquipment.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5"
                  >
                    <select
                      value={row.item}
                      onChange={(e) => updateEquipmentRow(idx, "item", e.target.value)}
                      className="flex-1 min-w-[140px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900"
                    >
                      <option value="">Select stock item</option>
                      {stockCatalog.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-gray-500">Qty:</span>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) =>
                          updateEquipmentRow(idx, "quantity", Number(e.target.value))
                        }
                        className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-center"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Notes"
                      value={row.notes}
                      onChange={(e) => updateEquipmentRow(idx, "notes", e.target.value)}
                      className="flex-1 min-w-[120px] rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700"
                    />

                    <button
                      type="button"
                      onClick={() => removeEquipmentRow(idx)}
                      className="text-gray-400 hover:text-red-600 p-1 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estimated Expenses
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={estimatedExpenses}
                  onChange={(e) => setEstimatedExpenses(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-2 text-xs text-gray-900 outline-none"
                />
                <DollarSign size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Change Notes (Optional)
              </label>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Reason for changes..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
