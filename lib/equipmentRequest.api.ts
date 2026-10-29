import {
  get,
  post,
  patch,
  ApiResponse,
} from "./api";

import type {
  EquipmentRequest,
  CreateEquipmentRequestPayload,
  EquipmentRequestListResponse,
} from "@/types/equipmentRequest";

// ==========================================
// SUBMIT EQUIPMENT REQUEST
// POST /api/equipment-requests
// ==========================================

export const createEquipmentRequest = async (
  payload: CreateEquipmentRequestPayload,
  token: string
): Promise<EquipmentRequest> => {
  const result = await post<ApiResponse<{ request: EquipmentRequest }>>(
    "/equipment-requests",
    payload,
    token
  );
  return result.data.request;
};

// ==========================================
// GET EQUIPMENT REQUESTS
// GET /api/equipment-requests
// ==========================================

export const getEquipmentRequests = async (
  token: string,
  params?: {
    task?: string;
    stockItem?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<EquipmentRequestListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.task) searchParams.set("task", params.task);
  if (params?.stockItem) searchParams.set("stockItem", params.stockItem);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `/equipment-requests?${query}` : "/equipment-requests";

  return get<EquipmentRequestListResponse>(endpoint, token);
};

// ==========================================
// APPROVE REQUEST (Manager)
// PATCH /api/equipment-requests/:id/approve
// ==========================================

export const approveEquipmentRequest = async (
  id: string,
  managerNotes: string = "",
  token: string
): Promise<EquipmentRequest> => {
  const result = await patch<ApiResponse<{ request: EquipmentRequest }>>(
    `/equipment-requests/${id}/approve`,
    { managerNotes },
    token
  );
  return result.data.request;
};

// ==========================================
// REJECT REQUEST (Manager)
// PATCH /api/equipment-requests/:id/reject
// ==========================================

export const rejectEquipmentRequest = async (
  id: string,
  rejectionReason: string,
  managerNotes: string = "",
  token: string
): Promise<EquipmentRequest> => {
  const result = await patch<ApiResponse<{ request: EquipmentRequest }>>(
    `/equipment-requests/${id}/reject`,
    { rejectionReason, managerNotes },
    token
  );
  return result.data.request;
};

// ==========================================
// ISSUE EQUIPMENT (Manager)
// PATCH /api/equipment-requests/:id/issue
// ==========================================

export const issueEquipmentRequest = async (
  id: string,
  token: string
): Promise<EquipmentRequest> => {
  const result = await patch<ApiResponse<{ request: EquipmentRequest }>>(
    `/equipment-requests/${id}/issue`,
    {},
    token
  );
  return result.data.request;
};

// ==========================================
// RETURN EQUIPMENT (Staff or Manager)
// PATCH /api/equipment-requests/:id/return
// ==========================================

export const returnEquipmentRequest = async (
  id: string,
  token: string
): Promise<EquipmentRequest> => {
  const result = await patch<ApiResponse<{ request: EquipmentRequest }>>(
    `/equipment-requests/${id}/return`,
    {},
    token
  );
  return result.data.request;
};

// ==========================================
// CANCEL REQUEST (Staff)
// PATCH /api/equipment-requests/:id/cancel
// ==========================================

export const cancelEquipmentRequest = async (
  id: string,
  token: string
): Promise<EquipmentRequest> => {
  const result = await patch<ApiResponse<{ request: EquipmentRequest }>>(
    `/equipment-requests/${id}/cancel`,
    {},
    token
  );
  return result.data.request;
};
