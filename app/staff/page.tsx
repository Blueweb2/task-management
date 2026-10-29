"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Package,
  Volume2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Send,
  Plus,
} from "lucide-react";
import AudioPlayer from "@/components/common/AudioPlayer";
import RequestEquipmentModal from "@/components/staff/RequestEquipmentModal";
import TaskDetailsModal from "@/components/manager/tasks/TaskDetailsModal";
import { useAuth } from "@/hooks/useAuth";
import { getTasks, updateTaskStatus } from "@/lib/task.api";
import { getEquipmentRequests } from "@/lib/equipmentRequest.api";
import type { Task, TaskStatus } from "@/types/task";
import type { EquipmentRequest } from "@/types/equipmentRequest";

export default function StaffHomePage() {
  const { user, token } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [requestEquipTask, setRequestEquipTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "requests">("tasks");

  const loadData = useCallback(
    async (silent = false) => {
      if (!token) return;
      try {
        if (!silent) setLoading(true);
        setError("");

        const [taskRes, equipRes] = await Promise.all([
          getTasks(token, { limit: 100 }),
          getEquipmentRequests(token, { limit: 50 }).catch(() => ({ data: [] })),
        ]);

        setTasks(taskRes.data || []);
        setEquipmentRequests(equipRes.data || []);
      } catch (err: any) {
        console.error("Staff dashboard error:", err);
        if (!silent) setError(err.message || "Failed to load assigned tasks.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  // Status progression action by staff
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (!token) return;
    try {
      const updated = await updateTaskStatus(task._id, newStatus, `Updated by ${user?.name || "staff"}`, token);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      if (selectedTask && selectedTask._id === task._id) {
        setSelectedTask(updated);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update task status.");
    }
  };

  // Quick stats
  const activeCount = useMemo(
    () => tasks.filter((t) => t.status === "ASSIGNED" || t.status === "IN_PROGRESS").length,
    [tasks]
  );
  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "COMPLETED").length,
    [tasks]
  );

  return (
    <div className="space-y-6 py-4">
      {/* Welcome Banner */}
      <section className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-7 shadow-xs overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-gradient-to-br from-[#9a6c37]/10 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#9a6c37] border border-amber-200">
              <Sparkles size={12} />
              Staff Portal
            </span>
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">• Live Workspace</span>
          </div>

          <h1 className="mt-2 text-xl font-black tracking-tight text-[#29241f] sm:text-2xl lg:text-3xl">
            Welcome back, {user?.name || "Staff Member"} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#756d64]">
            Here are your assigned tasks, voice instructions, and equipment requests.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setRequestEquipTask({} as any)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition active:scale-95 cursor-pointer"
          >
            <Package size={14} />
            <span>Request Equipment</span>
          </button>
          <Link
            href="/staff/attendance"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8e1d8] bg-[#faf8f5] px-3.5 py-2 text-xs font-bold text-[#29241f] hover:bg-white hover:border-[#9a6c37] transition active:scale-95"
          >
            <Clock3 size={14} className="text-[#9a6c37]" />
            <span>Clock In / Logs</span>
          </Link>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Total Assigned
          </span>
          <p className="mt-1 text-2xl font-black text-gray-900">{tasks.length}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
            Active / In Progress
          </span>
          <p className="mt-1 text-2xl font-black text-amber-900">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
            Completed
          </span>
          <p className="mt-1 text-2xl font-black text-emerald-900">{completedCount}</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
            Equipment Requests
          </span>
          <p className="mt-1 text-2xl font-black text-blue-900">{equipmentRequests.length}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Switcher: Assigned Tasks vs My Equipment Requests */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "tasks"
              ? "bg-[#29241f] text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ClipboardList size={14} />
          <span>My Tasks ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "requests"
              ? "bg-[#29241f] text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Package size={14} />
          <span>Equipment Requests ({equipmentRequests.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white">
          <Loader2 size={28} className="animate-spin text-[#9a6c37]" />
          <p className="mt-3 text-xs text-gray-500">Loading your tasks...</p>
        </div>
      ) : activeTab === "requests" ? (
        /* Equipment Requests List */
        equipmentRequests.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <Package size={30} className="text-gray-300 mb-2" />
            <p className="text-xs font-bold text-gray-700">No equipment requested yet</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Need additional tools or stock items? Click &quot;Request Equipment&quot; above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {equipmentRequests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">
                      {req.stockItem?.name || "Equipment Item"}
                    </span>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-gray-800">
                      Qty: {req.requestedQuantity} {req.stockItem?.unit || "pcs"}
                    </span>
                  </div>

                  {req.task && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Task: <span className="font-medium text-gray-800">{req.task.title}</span>
                    </p>
                  )}
                  {req.reason && (
                    <p className="text-[11px] text-gray-500 italic mt-0.5">
                      &quot;{req.reason}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      req.status === "PENDING"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : req.status === "APPROVED"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : req.status === "ISSUED"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : req.status === "RETURNED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tasks.length === 0 ? (
        /* Empty Tasks State */
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#9a6c37] mb-2">
            <ClipboardList size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No tasks assigned to you</h3>
          <p className="mt-1 text-xs text-gray-500">
            You are all caught up! New tasks assigned by your manager will appear here.
          </p>
        </div>
      ) : (
        /* Task Cards List */
        <div className="space-y-4">
          {tasks.map((task) => {
            const hasVoice = Boolean(task.voiceRecording?.url);
            const equipmentList = task.requiredEquipment || [];

            return (
              <div
                key={task._id}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-[#9a6c37]/50 space-y-3.5"
              >
                {/* Header: Title, Status, Priority */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : task.status === "IN_PROGRESS"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {task.status}
                      </span>

                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                        {task.priority} Priority
                      </span>

                      {task.location && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <MapPin size={12} className="text-[#9a6c37]" />
                          <span>{task.location}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{task.title}</h3>
                  </div>

                  {/* Due Date Indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-gray-200 self-start shrink-0">
                    <Calendar size={13} className="text-[#9a6c37]" />
                    <span>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Due Soon"}
                    </span>
                    {task.dueTime && (
                      <>
                        <Clock size={12} className="ml-1 text-gray-400" />
                        <span>{task.dueTime}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-gray-600 leading-relaxed bg-stone-50/50 p-3 rounded-2xl border border-gray-100">
                    {task.description}
                  </p>
                )}

                {/* Voice Recording Player */}
                {hasVoice && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#9a6c37] mb-1 block">
                      Manager Voice Message
                    </span>
                    <AudioPlayer
                      src={task.voiceRecording!.url}
                      duration={task.voiceRecording!.duration}
                      transcription={task.voiceRecording!.transcribedText}
                    />
                  </div>
                )}

                {/* Required Equipment List */}
                {equipmentList.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 p-3 bg-stone-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Required Equipment
                      </span>
                      <button
                        type="button"
                        onClick={() => setRequestEquipTask(task)}
                        className="text-[11px] font-bold text-[#9a6c37] hover:underline"
                      >
                        + Request More
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {equipmentList.map((eq, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-xl bg-white border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-2xs"
                        >
                          <Package size={12} className="text-gray-400" />
                          <span>
                            {typeof eq.item === "object" && eq.item !== null
                              ? (eq.item as any).name
                              : "Item"}
                            :
                          </span>
                          <span className="font-bold text-[#9a6c37]">{eq.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Task Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="text-xs font-bold text-gray-700 hover:text-[#9a6c37] transition"
                    >
                      View Full Details
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={() => setRequestEquipTask(task)}
                      className="text-xs font-bold text-[#9a6c37] hover:underline"
                    >
                      Request Equipment
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status !== "IN_PROGRESS" && task.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(task, "IN_PROGRESS")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition active:scale-95"
                      >
                        <Clock3 size={13} />
                        <span>Start Task</span>
                      </button>
                    )}

                    {task.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(task, "COMPLETED")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal (Staff View) */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={Boolean(selectedTask)}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {}}
          onStatusChange={handleStatusChange}
          isStaffView={true}
          onRequestEquipment={(t) => {
            setSelectedTask(null);
            setRequestEquipTask(t);
          }}
        />
      )}

      {/* Request Equipment Modal */}
      {token && requestEquipTask && (
        <RequestEquipmentModal
          isOpen={Boolean(requestEquipTask)}
          task={requestEquipTask?._id ? requestEquipTask : null}
          onClose={() => setRequestEquipTask(null)}
          onRequestSubmitted={loadData}
          token={token}
        />
      )}
    </div>
  );
}
