import type { TaskStockItem } from "./task";

export type EquipmentRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ISSUED"
  | "RETURNED"
  | "CANCELLED";

export interface EquipmentRequest {
  _id: string;
  task?: {
    _id: string;
    title: string;
    dueDate?: string;
    status?: string;
    priority?: string;
  } | null;
  stockItem: TaskStockItem;
  requestedQuantity: number;
  reason?: string;
  status: EquipmentRequestStatus;
  requestedBy: {
    _id: string;
    name: string;
    username: string;
    employeeId?: string;
    avatar?: string;
    department?: string;
    role?: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    username: string;
    role?: string;
  } | null;
  approvedAt?: string | null;
  rejectionReason?: string;
  issuedAt?: string | null;
  returnedAt?: string | null;
  managerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentRequestPayload {
  task?: string | null;
  stockItem: string;
  requestedQuantity: number;
  reason?: string;
}

export interface EquipmentRequestListResponse {
  success: boolean;
  data: EquipmentRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
