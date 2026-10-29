"use client";

import {
  Search,
  Plus,
  Filter,
  Calendar,
  X,
  Users,
} from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/types/task";

interface TaskFiltersBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  staffFilter: string;
  onStaffFilterChange: (staffId: string) => void;
  staffList: Array<{ _id: string; name: string }>;
  onCreateClick: () => void;
  statusCounts: Record<string, number>;
  totalTasks: number;
}

export default function TaskFiltersBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  staffFilter,
  onStaffFilterChange,
  staffList,
  onCreateClick,
  statusCounts,
  totalTasks,
}: TaskFiltersBarProps) {
  const statusTabs = [
    { key: "", label: "All Tasks", count: totalTasks },
    { key: "TODO", label: "To Do", count: statusCounts["TODO"] || 0 },
    { key: "ASSIGNED", label: "Assigned", count: statusCounts["ASSIGNED"] || 0 },
    { key: "IN_PROGRESS", label: "In Progress", count: statusCounts["IN_PROGRESS"] || 0 },
    { key: "COMPLETED", label: "Completed", count: statusCounts["COMPLETED"] || 0 },
    { key: "CANCELLED", label: "Cancelled", count: statusCounts["CANCELLED"] || 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Top row: Search, Dropdowns, and Create Task Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, description, or location..."
            className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-9 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] outline-none shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns & Create Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs focus:border-[#9A7B4F] outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent ⚡</option>
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => onStaffFilterChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs focus:border-[#9A7B4F] outline-none cursor-pointer max-w-[150px] truncate"
          >
            <option value="">All Staff</option>
            {staffList.map((st) => (
              <option key={st._id} value={st._id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Create Task Button */}
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#29241f] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-black transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-gray-200">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#29241f] text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-md px-1.5 py-0.2 text-[10px] font-extrabold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
