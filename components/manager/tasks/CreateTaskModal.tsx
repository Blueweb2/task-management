"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  MapPin,
  DollarSign,
  Package,
  Check,
  UserCheck,
  Briefcase,
  Loader2,
  Paperclip,
} from "lucide-react";
import AudioTaskRecorder from "@/components/common/AudioTaskRecorder";
import { createTask, uploadVoiceRecording } from "@/lib/task.api";
import { getServices } from "@/lib/services.api";
import { getStaffMembers } from "@/lib/staff.api";
import { getStockItems } from "@/lib/stock.api";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  token: string;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  token,
}: CreateTaskModalProps) {
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [dueTime, setDueTime] = useState("18:00");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [serviceId, setServiceId] = useState<string>("");
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [requiredEquipment, setRequiredEquipment] = useState<
    Array<{ item: string; quantity: number; notes: string }>
  >([]);
  const [estimatedExpenses, setEstimatedExpenses] = useState<string>("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Voice recording state
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [transcribedText, setTranscribedText] = useState<string>("");

  // Reference attachments state
  const [attachmentFiles, setAttachmentFiles] = useState<
    Array<{ name: string; url: string; fileType: string; size: number }>
  >([]);

  // Catalogs
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [stockCatalog, setStockCatalog] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch catalogs when modal opens
  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;
    setCatalogLoading(true);

    Promise.all([
      getServices().catch(() => ({ services: [] })),
      getStaffMembers(token, { limit: 100 }).catch(() => ({ staff: [] })),
      getStockItems(token, { limit: 100 }).catch(() => ({ items: [] })),
    ])
      .then(([serviceRes, staffRes, stockRes]) => {
        if (!isMounted) return;
        setServices((serviceRes as any).services || (serviceRes as any).data || []);
        setStaffList((staffRes as any).staff || (staffRes as any).data || []);
        setStockCatalog((stockRes as any).items || (stockRes as any).data || []);
      })
      .finally(() => {
        if (isMounted) setCatalogLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Toggle staff selection
const toggleStaff = (staffId: string) => {
  if (!staffId) return;

  setAssignedStaffIds((prev) =>
    prev.includes(staffId)
      ? prev.filter((id) => id !== staffId)
      : [...prev, staffId]
  );
};

  // Equipment helpers
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

  // Attachment upload simulation / file reading
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachmentFiles((prev) => [
            ...prev,
            {
              name: f.name,
              url: event.target?.result as string,
              fileType: f.type || "application/octet-stream",
              size: f.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(f);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
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
      let voiceRecordingPayload = {
        url: "",
        duration: audioDuration,
        format: "audio/webm",
        transcribedText,
      };

      // If manager recorded audio, upload it first
      if (recordedAudioBlob) {
        try {
          const uploadRes = await uploadVoiceRecording(
            recordedAudioBlob,
            token,
            `task-voice-${Date.now()}.webm`
          );
          voiceRecordingPayload.url = uploadRes.url;
        } catch (uploadErr) {
          console.warn("Could not upload audio file to server:", uploadErr);
        }
      }

      // Filter valid equipment
      const validEquipment = requiredEquipment
        .filter((eq) => eq.item && eq.quantity > 0)
        .map((eq) => ({
          item: eq.item,
          quantity: Number(eq.quantity),
          notes: eq.notes || "",
        }));

      const created = await createTask(
        {
          title: title.trim(),
          description: description.trim(),
          taskDate,
          dueDate,
          dueTime: dueTime.trim(),
          priority,
          service: serviceId || null,
          assignedStaff: assignedStaffIds,
          requiredEquipment: validEquipment,
          voiceRecording: voiceRecordingPayload.url
            ? voiceRecordingPayload
            : undefined,
          attachments: attachmentFiles,
          estimatedExpenses: estimatedExpenses ? Number(estimatedExpenses) : 0,
          location: location.trim(),
          notes: notes.trim(),
        },
        token
      );

      onTaskCreated(created);
      onClose();
    } catch (err: any) {
      console.error("Create task error:", err);
      setError(err.message || "Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4.5 bg-stone-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create New Task</h2>
            <p className="text-xs text-gray-500">
              Assign staff, attach equipment, and record voice instructions
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Title & Description */}
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
                placeholder="e.g. Stage lighting setup & audio system soundcheck"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none"
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
                placeholder="Provide details about requirements, step-by-step procedures, or special guidelines..."
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none resize-none"
              />
            </div>
          </div>

          {/* 2. Voice Recording Component */}
          <div>
            <AudioTaskRecorder
              onAudioReady={(blob, duration, transcript) => {
                setRecordedAudioBlob(blob);
                setAudioDuration(duration);
                if (transcript) {
                  setTranscribedText(transcript);
                }
              }}
              onAudioClear={() => {
                setRecordedAudioBlob(null);
                setAudioDuration(0);
                setTranscribedText("");
              }}
              onTranscriptGenerated={(transcriptText) => {
                setTranscribedText(transcriptText);
                // Auto-fill description if currently empty
                setDescription((prev) => (prev ? prev : transcriptText));
              }}
            />
          </div>

          {/* 3. Date, Due Date & Time, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Task Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#2563eb] outline-none"
                />
              </div>
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

          {/* 4. Service / Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Task Category / Service
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#2563eb] outline-none bg-white cursor-pointer"
              >
                <option value="">None / Custom Category</option>
                {services.map((svc) => (
                  <option key={svc._id} value={svc._id}>
                    {svc.name} ({svc.category || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Task Location / Site
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Hall, Floor 2, Warehouse B"
                  className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-2 text-xs text-gray-900 focus:border-[#2563eb] outline-none"
                />
                <MapPin size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 5. Assign Staff Members (Multiple Selection) */}
          <div className="rounded-2xl border border-gray-200 p-4 bg-stone-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  Assign Staff Members ({assignedStaffIds.length} Selected)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Select one or more staff members to execute this task
                </p>
              </div>
            </div>

            {catalogLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-gray-500">
                <Loader2 size={16} className="animate-spin text-[#2563eb]" />
                <span>Loading staff directory...</span>
              </div>
            ) : staffList.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">No staff members found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                {staffList.map((st) => {
                  const staffId = String(st._id ?? st.id ?? "");

                  if (!staffId) {
                    console.warn("Staff record is missing an ID:", st);
                    return null;
                  }

                  const isSelected = assignedStaffIds.includes(staffId);

                  return (
                    <button
                      key={staffId}
                      type="button"
                      onClick={() => toggleStaff(staffId)}
                      className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition active:scale-[0.98] cursor-pointer ${isSelected
                          ? "border-[#2563eb] bg-[#2563eb]/10 shadow-2xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-xs font-bold text-white">
                        {st.name ? st.name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-gray-900">
                          {st.name}
                        </p>
                        <p className="truncate text-[10px] text-gray-500">
                          {st.department || st.role || "Staff"}
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
            )}
          </div>

          {/* 6. Required Equipment */}
          <div className="rounded-2xl border border-gray-200 p-4 bg-stone-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  Required Equipment & Tools
                </h4>
                <p className="text-[11px] text-gray-500">
                  Specify items needed by assigned staff to complete this task
                </p>
              </div>
              <button
                type="button"
                onClick={addEquipmentRow}
                className="inline-flex items-center gap-1 rounded-xl bg-white border border-gray-300 px-2.5 py-1 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition active:scale-95 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            {requiredEquipment.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">
                No equipment added yet. Click &quot;Add Item&quot; if tools or stock items are required.
              </p>
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
                      className="flex-1 min-w-[140px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-[#2563eb] outline-none"
                    >
                      <option value="">Select stock item</option>
                      {stockCatalog.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} ({item.availableQuantity} available)
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-gray-500 font-medium">Qty:</span>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) =>
                          updateEquipmentRow(idx, "quantity", Number(e.target.value))
                        }
                        className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-900 focus:border-[#2563eb] outline-none text-center"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={row.notes}
                      onChange={(e) => updateEquipmentRow(idx, "notes", e.target.value)}
                      className="flex-1 min-w-[120px] rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-[#2563eb] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeEquipmentRow(idx)}
                      className="text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Estimated Expenses & Attachments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estimated Expenses ($ / ₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={estimatedExpenses}
                  onChange={(e) => setEstimatedExpenses(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-2 text-xs text-gray-900 focus:border-[#2563eb] outline-none"
                />
                <DollarSign size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Attachments / Reference Images
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                  <Paperclip size={14} />
                  <span>Choose Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-gray-500">
                  {attachmentFiles.length} file(s) attached
                </span>
              </div>
            </div>
          </div>

          {/* Attachment list */}
          {attachmentFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {attachmentFiles.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-2xs"
                >
                  <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1e40af] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Creating Task...</span>
                </>
              ) : (
                <span>Create & Assign Task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
