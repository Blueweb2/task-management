"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  ShieldCheck,
  ChefHat,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import StaffList from "./StaffList";
import AddStaffModal from "./AddStaffModal";
import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/hooks/useAuth";
import type { CreateStaffPayload, Staff } from "@/types/staff";

export default function StaffDirectoryTab() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const role = (user?.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin" || role === "admin";
  const isChefManager =
    role === "manager" &&
    String(user?.department || "").toLowerCase().includes("kitchen");
  const isDepartmentManager = role === "manager" && !isChefManager;

  const filters = useMemo(
    () => ({
      page: 1,
      limit: 20,
    }),
    []
  );

  const {
    staff,
    pagination,
    summary,
    loading,
    error,
    fetchStaff,
    addStaff,
    clearError,
  } = useStaff({
    token,
    filters,
  });

  const handleOpenAddStaff = useCallback(() => {
    clearError();
    setIsAddModalOpen(true);
  }, [clearError]);

  const handleCloseAddStaff = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleCreateStaff = useCallback(
    async (payload: CreateStaffPayload): Promise<Staff> => {
      const newStaff = await addStaff(payload);

      await fetchStaff({
        page: 1,
        limit: 20,
      });

      setIsAddModalOpen(false);
      return newStaff;
    },
    [addStaff, fetchStaff]
  );

  const handleRetry = async () => {
    clearError();
    await fetchStaff({
      page: pagination.page || 1,
      limit: pagination.limit || 20,
    });
  };

  // Compute metrics fallback from staff list if summary is not yet available
  const computedStats = useMemo(() => {
    if (summary) {
      return {
        totalManagers: summary.totalManagers,
        totalStaff: summary.totalStaff,
        active: summary.activeEmployees,
        inactive: summary.inactiveEmployees,
        departments: Object.keys(summary.departmentCounts || {}).length,
      };
    }
    const totalStaff = pagination.total || staff.length;
    const active = staff.filter((s) => s.isActive).length;
    const inactive = staff.filter((s) => !s.isActive).length;
    const departments = new Set(staff.map((s) => s.department).filter(Boolean)).size;
    const totalManagers = staff.filter(
      (s) => s.role === "manager" || s.role === "admin" || s.role === "superadmin"
    ).length;

    return { totalManagers, totalStaff, active, inactive, departments };
  }, [summary, pagination.total, staff]);

  return (
    <div className="space-y-6">
      {/* Top Header Summary Cards adapted to user role */}
    

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 font-medium"
        >
          <AlertCircle size={15} />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Staff List */}
      <StaffList
        staff={staff}
        pagination={pagination}
        summary={summary}
        loading={loading}
        error={error}
        onFetchStaff={fetchStaff}
        onClearError={clearError}
        onAddStaff={handleOpenAddStaff}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddStaff}
        onSave={handleCreateStaff}
      />
    </div>
  );
}
