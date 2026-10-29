"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getExpenses } from "@/lib/expense.api";
import { getAssignments } from "@/lib/assignment.api";
import { getTasks } from "@/lib/task.api";
import { getEquipmentRequests } from "@/lib/equipmentRequest.api";
import { useAuth } from "@/hooks/useAuth";
import { formatTime24to12 } from "@/lib/time-utils";

export type NotificationCategory = "ACTION" | "EVENT" | "FINANCE" | "ESTIMATE" | "STAFF" | "TASK" | "EQUIPMENT";

export interface ManagerNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  link: string;
  read: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const STORAGE_KEY = "event_manager_read_notifs";
const DISMISSED_KEY = "event_manager_dismissed_notifs";

export function useManagerNotifications() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [rawNotifications, setRawNotifications] = useState<ManagerNotification[]>([]);

  const fetchLiveNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);

      const [tasksRes, equipRes, expensesRes, assignmentsRes] = await Promise.allSettled([
        getTasks(token, { limit: 20 }),
        getEquipmentRequests(token, { status: "PENDING" }),
        getExpenses(),
        getAssignments(token, { limit: 50 }),
      ]);

      const items: ManagerNotification[] = [];
      const now = new Date();

      // 1. Pending Equipment Requests needing manager approval/issuance
      if (equipRes.status === "fulfilled" && equipRes.value?.data) {
        equipRes.value.data.forEach((req) => {
          const staffName = req.requestedBy && typeof req.requestedBy === "object" ? req.requestedBy.name : "Staff member";
          const itemName = req.stockItem && typeof req.stockItem === "object" ? req.stockItem.name : "Equipment";
          const taskTitle = req.task && typeof req.task === "object" ? req.task.title : "Assigned Task";

          items.push({
            id: `equip-req-${req._id}`,
            category: "EQUIPMENT",
            title: `🛠️ Equipment Request: ${req.requestedQuantity}x ${itemName}`,
            message: `${staffName} requested ${req.requestedQuantity} units of ${itemName} for "${taskTitle}".`,
            timestamp: req.createdAt,
            timeAgo: "Action Needed",
            link: `/manager/tasks?tab=equipment-requests`,
            read: false,
            priority: "HIGH",
          });
        });
      }

      // 2. High Priority or Urgent Tasks
      if (tasksRes.status === "fulfilled" && tasksRes.value?.data) {
        tasksRes.value.data.forEach((t) => {
          if (t.priority === "URGENT" || t.priority === "HIGH") {
            const isCompleted = t.status === "COMPLETED" || t.status === "CANCELLED";
            if (!isCompleted) {
              items.push({
                id: `task-alert-${t._id}`,
                category: "TASK",
                title: `${t.priority === "URGENT" ? "🔥 Urgent Task" : "⚡ High Priority Task"}: ${t.title}`,
                message: `Status: ${t.status.replace("_", " ")} | Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No deadline"}`,
                timestamp: t.updatedAt || t.createdAt,
                timeAgo: t.priority,
                link: `/manager/tasks`,
                read: false,
                priority: t.priority === "URGENT" ? "HIGH" : "MEDIUM",
              });
            }
          }
        });
      }

      // 3. Pending Expenses needing manager attention
      if (expensesRes.status === "fulfilled" && Array.isArray(expensesRes.value)) {
        const pendingExpenses = expensesRes.value.filter((exp) => exp.status === "Pending");
        pendingExpenses.slice(0, 5).forEach((exp) => {
          items.push({
            id: `exp-pending-${exp.id}`,
            category: "FINANCE",
            title: `Pending Expense: ₹${exp.amount.toLocaleString("en-IN")}`,
            message: `Expense "${exp.title}" (${exp.category}) is awaiting settlement.`,
            timestamp: exp.date,
            timeAgo: "Awaiting Action",
            link: `/manager/expenses`,
            read: false,
            priority: exp.amount > 50000 ? "HIGH" : "MEDIUM",
          });
        });
      }

      // 4. Staff Shift Rejections & Responses
      if (assignmentsRes.status === "fulfilled" && assignmentsRes.value?.data) {
        assignmentsRes.value.data.forEach((duty) => {
          const staffName = typeof duty.staff === "object" ? duty.staff.name : "Staff member";
          const staffId = typeof duty.staff === "object" && duty.staff !== null ? (duty.staff.id || (duty.staff as any)._id) : (typeof duty.staff === "string" ? duty.staff : "");

          if (duty.status === "REJECTED") {
            items.push({
              id: `duty-rejected-${duty._id}`,
              category: "STAFF",
              title: `🚨 Shift Declined: ${staffName}`,
              message: `${staffName} declined "${duty.dutyTitle}". Reason: "${duty.rejectionReason || "Unavailable"}". Click to reassign.`,
              timestamp: duty.respondedAt || duty.updatedAt || duty.dutyDate,
              timeAgo: "Action Required",
              link: staffId ? `/manager/staff/${staffId}?tab=schedule` : "/manager/staff",
              read: false,
              priority: "HIGH",
            });
          }
        });
      }

      // Fallback notification if system is fresh
      if (items.length === 0) {
        items.push({
          id: "sys-ready-1",
          category: "ACTION",
          title: "All Systems Running Smoothly",
          message: "No pending alerts or overdue shifts. Your event operations are fully up to date.",
          timestamp: new Date().toISOString(),
          timeAgo: "Just now",
          link: "/manager",
          read: true,
          priority: "LOW",
        });
      }

      setRawNotifications(items);
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchLiveNotifications();
    // Re-check periodically every 60 seconds
    const interval = setInterval(fetchLiveNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  // Combine with read & dismissed states
  const notifications = useMemo(() => {
    return rawNotifications
      .filter((n) => !dismissedIds.includes(n.id))
      .map((n) => ({
        ...n,
        read: n.read || readIds.includes(n.id),
      }));
  }, [rawNotifications, readIds, dismissedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    } catch {}
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const updated = [...prev, id];
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setDismissedIds(allIds);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(allIds));
    } catch {}
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    refresh: fetchLiveNotifications,
  };
}
