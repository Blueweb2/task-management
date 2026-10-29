"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ListTodo,
  Plus,
  Package,
  Loader2,
  AlertCircle,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock3,
  Calendar,
  Sparkles,
} from "lucide-react";
import TaskCard from "@/components/manager/tasks/TaskCard";
import TaskFiltersBar from "@/components/manager/tasks/TaskFiltersBar";
import CreateTaskModal from "@/components/manager/tasks/CreateTaskModal";
import EditTaskModal from "@/components/manager/tasks/EditTaskModal";
import TaskDetailsModal from "@/components/manager/tasks/TaskDetailsModal";
import EquipmentRequestsTab from "@/components/manager/tasks/EquipmentRequestsTab";
import { useAuth } from "@/hooks/useAuth";
import { getTasks, updateTaskStatus, deleteTask } from "@/lib/task.api";
import { getStaffMembers } from "@/lib/staff.api";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

export default function ManagerTasksPage() {
  const { token, user } = useAuth();

  // Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"tasks" | "equipment">("tasks");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Load tasks from API
  const loadTasks = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await getTasks(token, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        assignedStaff: staffFilter || undefined,
        search: search.trim() || undefined,
        limit: 200,
      });
      setTasks(res.data || []);
    } catch (err: any) {
      console.error("Load tasks error:", err);
      if (!silent) setError(err.message || "Failed to load tasks.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, statusFilter, priorityFilter, staffFilter, search]);

  // Load staff directory for filter dropdown
  useEffect(() => {
    if (!token) return;
    getStaffMembers(token, { limit: 100 })
      .then((res: any) => setStaffList(res.staff || res.data || []))
      .catch(() => setStaffList([]));
  }, [token]);

  // Initial & reactive fetch
  useEffect(() => {
    void loadTasks(false);
  }, [loadTasks]);

  // Compute status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TODO: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      }
    });
    return counts;
  }, [tasks]);

  // Status progression action
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (!token) return;
    try {
      const updated = await updateTaskStatus(task._id, newStatus, `Status updated to ${newStatus}`, token);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      if (selectedTaskForDetails && selectedTaskForDetails._id === task._id) {
        setSelectedTaskForDetails(updated);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update task status.");
    }
  };

  // Delete / Cancel action
  const handleDeleteTask = async (task: Task) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to cancel the task: "${task.title}"?`)) return;

    try {
      await deleteTask(task._id, token);
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: "CANCELLED" } : t))
      );
      if (selectedTaskForDetails && selectedTaskForDetails._id === task._id) {
        setSelectedTaskForDetails(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to cancel task.");
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    if (selectedTaskForDetails && selectedTaskForDetails._id === updatedTask._id) {
      setSelectedTaskForDetails(updatedTask);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Top Banner / Heading */}
      <section className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-[#dbeafe] bg-white p-5 sm:p-7 shadow-xs overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-gradient-to-br from-[#2563eb]/10 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Operations Center
            </span>

            <span className="hidden text-xs font-medium text-slate-400 sm:inline">
              • Task Management
            </span>
          </div>

          <h1 className="mt-2 text-xl font-black tracking-tight text-[#0f172a] sm:text-2xl lg:text-3xl">
            To Do & Task Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#475569]">
            Create tasks, record voice messages, assign staff, and track progress end-to-end.
          </p>
        </div>

        {/* Action Tabs: Tasks vs Equipment Requests */}
        <div className="relative z-10 flex items-center gap-2 self-start sm:self-center shrink-0 bg-stone-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${activeTab === "tasks"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <ListTodo size={15} />
            <span>Tasks ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("equipment")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${activeTab === "equipment"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <Package size={15} />
            <span>Equipment Requests</span>
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <AlertCircle size={17} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => void loadTasks()}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === "equipment" ? (
        token && <EquipmentRequestsTab token={token} />
      ) : (
        <div className="space-y-4">
          {/* Filters Bar & View Mode Toggle */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  View Mode:
                </span>
                <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-1.5 transition ${viewMode === "grid"
                        ? "bg-[#0f172a] text-white shadow-2xs"
                        : "text-gray-400 hover:text-gray-700"
                      }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg p-1.5 transition ${viewMode === "list"
                        ? "bg-[#0f172a] text-white shadow-2xs"
                        : "text-gray-400 hover:text-gray-700"
                      }`}
                    title="List View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            <TaskFiltersBar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              staffFilter={staffFilter}
              onStaffFilterChange={setStaffFilter}
              staffList={staffList}
              onCreateClick={() => setIsCreateOpen(true)}
              statusCounts={statusCounts}
              totalTasks={tasks.length}
            />
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-8">
              <Loader2 size={28} className="animate-spin text-[#2563eb]" />
              <p className="mt-3 text-xs font-medium text-gray-500">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-[#2563eb] mb-3">
                <ListTodo size={28} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">No tasks found</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                {search || statusFilter || priorityFilter || staffFilter
                  ? "Try resetting your search filters to find what you are looking for."
                  : "Get started by creating your first task with assigned staff and voice instructions."}
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-[#0f172a] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-black transition active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>Create New Task</span>
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onSelect={setSelectedTaskForDetails}
                  onEdit={setSelectedTaskForEdit}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onSelect={setSelectedTaskForDetails}
                  onEdit={setSelectedTaskForEdit}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {token && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onTaskCreated={handleTaskCreated}
          token={token}
        />
      )}

      {/* Edit Task Modal */}
      {token && selectedTaskForEdit && (
        <EditTaskModal
          isOpen={Boolean(selectedTaskForEdit)}
          task={selectedTaskForEdit}
          onClose={() => setSelectedTaskForEdit(null)}
          onTaskUpdated={handleTaskUpdated}
          token={token}
        />
      )}

      {/* Task Details Modal */}
      {selectedTaskForDetails && (
        <TaskDetailsModal
          isOpen={Boolean(selectedTaskForDetails)}
          task={selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          onEdit={(t) => {
            setSelectedTaskForDetails(null);
            setSelectedTaskForEdit(t);
          }}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
