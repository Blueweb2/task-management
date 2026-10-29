"use client";

import {
  X,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Package,
  Paperclip,
  CheckCircle2,
  Clock3,
  Edit2,
  Trash2,
  History,
  Phone,
  Mail,
  User,
} from "lucide-react";
import AudioPlayer from "@/components/common/AudioPlayer";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onDelete?: (task: Task) => void;
  isStaffView?: boolean;
  onRequestEquipment?: (task: Task) => void;
}

export default function TaskDetailsModal({
  isOpen,
  task,
  onClose,
  onEdit,
  onStatusChange,
  onDelete,
  isStaffView = false,
  onRequestEquipment,
}: TaskDetailsModalProps) {
  if (!isOpen || !task) return null;

  const priorityConfig: Record<TaskPriority, { label: string; badge: string }> = {
    LOW: { label: "Low", badge: "bg-slate-100 text-slate-700 border-slate-200" },
    MEDIUM: { label: "Medium", badge: "bg-blue-50 text-blue-700 border-blue-200" },
    HIGH: { label: "High", badge: "bg-amber-50 text-amber-800 border-amber-200" },
    URGENT: { label: "Urgent ⚡", badge: "bg-rose-50 text-rose-700 border-rose-200 font-extrabold" },
  };

  const statusConfig: Record<TaskStatus, { label: string; badge: string; dot: string }> = {
    TODO: { label: "To Do", badge: "bg-stone-100 text-stone-700 border-stone-200", dot: "bg-stone-400" },
    ASSIGNED: { label: "Assigned", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
    IN_PROGRESS: { label: "In Progress", badge: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500 animate-pulse" },
    COMPLETED: { label: "Completed", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    CANCELLED: { label: "Cancelled", badge: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-400" },
  };

  const currPriority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const currStatus = statusConfig[task.status] || statusConfig.TODO;

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";

  const serviceName =
    typeof task.service === "object" && task.service !== null
      ? (task.service as any).name
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4.5 bg-stone-50/60">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${currStatus.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currStatus.dot}`} />
                <span>{currStatus.label}</span>
              </span>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${currPriority.badge}`}
              >
                {currPriority.label}
              </span>

              {serviceName && (
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                  {serviceName}
                </span>
              )}
            </div>

            <h2 className="text-lg font-black tracking-tight text-gray-900 pt-1">
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-stone-50 p-3.5 border border-gray-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Due Date
              </span>
              <p className="mt-0.5 font-bold text-gray-900 flex items-center gap-1">
                <Calendar size={13} className="text-[#2563eb]" />
                <span>{formattedDueDate}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Due Time
              </span>
              <p className="mt-0.5 font-bold text-gray-900 flex items-center gap-1">
                <Clock size={13} className="text-[#2563eb]" />
                <span>{task.dueTime || "Anytime"}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Location
              </span>
              <p className="mt-0.5 font-medium text-gray-900 flex items-center gap-1 truncate">
                <MapPin size={13} className="text-[#2563eb] shrink-0" />
                <span className="truncate">{task.location || "On-site"}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Estimated Expense
              </span>
              <p className="mt-0.5 font-bold text-gray-900 flex items-center gap-1">
                <DollarSign size={13} className="text-emerald-600" />
                <span>{task.estimatedExpenses ? `$${task.estimatedExpenses}` : "$0.00"}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Description & Instructions
              </h4>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {/* Voice Recording Player */}
          {task.voiceRecording?.url && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Voice Recording Instruction
              </h4>
              <AudioPlayer
                src={task.voiceRecording.url}
                duration={task.voiceRecording.duration}
                transcription={task.voiceRecording.transcribedText}
              />
            </div>
          )}

          {/* Assigned Staff Members */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Assigned Staff ({(task.assignedStaff || []).length})
            </h4>
            {(task.assignedStaff || []).length === 0 ? (
              <p className="text-xs text-gray-400 italic">No staff assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {task.assignedStaff.map((st) => (
                  <div
                    key={st._id}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xs"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-800 text-xs font-bold text-white">
                      {st.name ? st.name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-gray-900">{st.name}</p>
                      <p className="truncate text-[10px] text-gray-500 font-medium">
                        {st.department || st.role || "Staff Member"}
                      </p>
                      {st.phone && (
                        <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                          <Phone size={10} />
                          <span>{st.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Required Equipment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Required Equipment & Tools ({(task.requiredEquipment || []).length})
              </h4>
              {isStaffView && onRequestEquipment && (
                <button
                  type="button"
                  onClick={() => onRequestEquipment(task)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline"
                >
                  <Package size={13} />
                  <span>Request More Equipment</span>
                </button>
              )}
            </div>

            {(task.requiredEquipment || []).length === 0 ? (
              <p className="text-xs text-gray-400 italic">No equipment required for this task.</p>
            ) : (
              <div className="space-y-2">
                {task.requiredEquipment.map((eq, idx) => {
                  const itemName =
                    typeof eq.item === "object" && eq.item !== null
                      ? (eq.item as any).name
                      : "Stock Item";
                  const unit =
                    typeof eq.item === "object" && eq.item !== null
                      ? (eq.item as any).unit || "units"
                      : "units";

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                          <Package size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{itemName}</p>
                          {eq.notes && <p className="text-[11px] text-gray-500">{eq.notes}</p>}
                        </div>
                      </div>
                      <span className="rounded-lg bg-stone-100 px-2 py-1 font-bold text-gray-800">
                        {eq.quantity} {unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Attachments */}
          {(task.attachments || []).length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Attachments & References ({task.attachments.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#2563eb] transition"
                  >
                    <Paperclip size={13} className="text-[#2563eb]" />
                    <span className="truncate max-w-[180px]">{att.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status Progression History */}
          {(task.statusHistory || []).length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <History size={13} />
                <span>Task History</span>
              </h4>
              <div className="rounded-2xl border border-gray-200 bg-stone-50/50 p-3 space-y-2">
                {(task.statusHistory || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[11px] text-gray-600">
                    <span className="font-mono text-gray-400 mt-0.5">
                      {new Date(item.changedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-bold text-gray-900">{item.status}:</span>
                    <span className="flex-1 text-gray-600">{item.notes || "Status updated"}</span>
                    {item.changedBy && (
                      <span className="text-gray-400 font-medium">
                        by {(item.changedBy as any).name || (item.changedBy as any).username}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 bg-stone-50/60">
          <div className="flex items-center gap-2">
            {!isStaffView && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-white transition cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>

                {onDelete && task.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Cancel Task</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Status Progression Buttons */}
          <div className="flex items-center gap-2">
            {task.status !== "IN_PROGRESS" && task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={() => onStatusChange(task, "IN_PROGRESS")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition active:scale-95 cursor-pointer"
              >
                <Clock3 size={14} />
                <span>Mark In Progress</span>
              </button>
            )}

            {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={() => onStatusChange(task, "COMPLETED")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Mark Completed</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
