"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Volume2,
  Package,
  Paperclip,
  CheckCircle2,
  Clock3,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
} from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
  onDelete?: (task: Task) => void;
}

export default function TaskCard({
  task,
  onSelect,
  onEdit,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  // Priority styling
  const priorityConfig: Record<TaskPriority, { label: string; badge: string }> = {
    LOW: { label: "Low", badge: "bg-slate-100 text-slate-700 border-slate-200" },
    MEDIUM: { label: "Medium", badge: "bg-blue-50 text-blue-700 border-blue-200" },
    HIGH: { label: "High", badge: "bg-amber-50 text-amber-800 border-amber-200" },
    URGENT: { label: "Urgent ⚡", badge: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-extrabold" },
  };

  // Status styling
  const statusConfig: Record<TaskStatus, { label: string; badge: string; dot: string }> = {
    TODO: { label: "To Do", badge: "bg-stone-100 text-stone-700 border-stone-200", dot: "bg-stone-400" },
    ASSIGNED: { label: "Assigned", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
    IN_PROGRESS: { label: "In Progress", badge: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500 animate-pulse" },
    COMPLETED: { label: "Completed", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    CANCELLED: { label: "Cancelled", badge: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-400" },
  };

  const currPriority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const currStatus = statusConfig[task.status] || statusConfig.TODO;

  // Format date: "Nov 25, 2026"
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "No due date";

  // Check if overdue
  const isOverdue =
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED" &&
    task.dueDate &&
    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const serviceName =
    typeof task.service === "object" && task.service !== null
      ? (task.service as any).name
      : null;

  const staffList = task.assignedStaff || [];
  const equipmentCount = (task.requiredEquipment || []).length;
  const hasVoice = Boolean(task.voiceRecording?.url);
  const attachmentCount = (task.attachments || []).length;

  return (
    <div
      onClick={() => onSelect(task)}
      className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4.5 shadow-xs transition hover:border-[#2563eb]/60 hover:shadow-md cursor-pointer"
    >
      {/* Top Header: Category, Priority, Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${currStatus.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${currStatus.dot}`} />
            <span>{currStatus.label}</span>
          </span>

          {/* Priority Badge */}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${currPriority.badge}`}
          >
            {currPriority.label}
          </span>

          {/* Service Tag */}
          {serviceName && (
            <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
              {serviceName}
            </span>
          )}
        </div>

        {/* Quick Actions Menu Trigger */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <Edit2 size={13} />
          </button>
          {onDelete && task.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              title="Cancel Task"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="mt-3">
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#2563eb] transition line-clamp-2">
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta indicators: Location, Voice, Equipment, Attachments */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
        {/* Due Date & Time */}
        <div
          className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-600 font-bold" : "text-gray-600"
            }`}
        >
          <Calendar size={12} />
          <span>{formattedDate}</span>
          {task.dueTime && (
            <>
              <Clock size={11} className="ml-1" />
              <span>{task.dueTime}</span>
            </>
          )}
          {isOverdue && <span className="text-[9px] uppercase tracking-wider text-red-600 ml-0.5">(Overdue)</span>}
        </div>

        {task.location && (
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin size={12} />
            <span className="truncate max-w-[120px]">{task.location}</span>
          </div>
        )}

        {/* Voice Note Indicator */}
        {hasVoice && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
            <Volume2 size={11} className="text-blue-600" />
            <span>Voice Note</span>
          </span>
        )}

        {/* Equipment Count */}
        {equipmentCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-700">
            <Package size={11} />
            <span>{equipmentCount} item{equipmentCount > 1 ? "s" : ""}</span>
          </span>
        )}

        {/* Attachments */}
        {attachmentCount > 0 && (
          <span className="inline-flex items-center gap-1 text-gray-400">
            <Paperclip size={11} />
            <span>{attachmentCount}</span>
          </span>
        )}
      </div>

      {/* Bottom Footer: Assigned Staff Avatars & Progression Action */}
      <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-gray-100">
        {/* Staff Avatars */}
        <div className="flex items-center gap-1.5 min-w-0">
          {staffList.length === 0 ? (
            <span className="text-[11px] text-gray-400 italic">Unassigned</span>
          ) : (
            <div className="flex -space-x-1.5 overflow-hidden">
              {staffList.slice(0, 3).map((st) => (
                <div
                  key={st._id}
                  title={`${st.name} (${st.department || "Staff"})`}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-800 text-[10px] font-bold text-white ring-2 ring-white"
                >
                  {st.name ? st.name.charAt(0).toUpperCase() : "S"}
                </div>
              ))}
              {staffList.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-[9px] font-bold text-gray-600 ring-2 ring-white">
                  +{staffList.length - 3}
                </div>
              )}
            </div>
          )}

          {staffList.length > 0 && (
            <span className="truncate text-[11px] text-gray-600 font-medium">
              {staffList[0].name}
              {staffList.length > 1 ? ` +${staffList.length - 1}` : ""}
            </span>
          )}
        </div>

        {/* Quick status progress button */}
        {onStatusChange && (
          <div onClick={(e) => e.stopPropagation()}>
            {task.status === "TODO" || task.status === "ASSIGNED" ? (
              <button
                type="button"
                onClick={() => onStatusChange(task, "IN_PROGRESS")}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
              >
                <Clock3 size={12} />
                <span>Start</span>
              </button>
            ) : task.status === "IN_PROGRESS" ? (
              <button
                type="button"
                onClick={() => onStatusChange(task, "COMPLETED")}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <CheckCircle2 size={12} />
                <span>Complete</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
