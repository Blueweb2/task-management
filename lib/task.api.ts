import {
  get,
  post,
  put,
  patch,
  del,
  ApiResponse,
} from "./api";

import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  TaskListResponse,
  DeleteTaskResponse,
} from "@/types/task";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==========================================
// CREATE TASK
// POST /api/tasks
// ==========================================

export const createTask = async (
  payload: CreateTaskPayload,
  token: string
): Promise<Task> => {
  const result = await post<ApiResponse<{ task: Task }>>(
    "/tasks",
    payload,
    token
  );
  return result.data.task;
};

// ==========================================
// GET TASKS
// GET /api/tasks
// ==========================================

export const getTasks = async (
  token: string,
  params?: TaskFilters
): Promise<TaskListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set("status", params.status);
  if (params?.priority) searchParams.set("priority", params.priority);
  if (params?.service) searchParams.set("service", params.service);
  if (params?.assignedStaff) searchParams.set("assignedStaff", params.assignedStaff);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `/tasks?${query}` : "/tasks";

  return get<TaskListResponse>(endpoint, token);
};

// ==========================================
// GET TASK BY ID
// GET /api/tasks/:id
// ==========================================

export const getTaskById = async (
  id: string,
  token: string
): Promise<Task> => {
  if (!id) throw new Error("Task ID is required");

  const result = await get<ApiResponse<{ task: Task }>>(
    `/tasks/${id}`,
    token
  );
  return result.data.task;
};

// ==========================================
// UPDATE TASK
// PUT /api/tasks/:id
// ==========================================

export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload,
  token: string
): Promise<Task> => {
  if (!id) throw new Error("Task ID is required");

  const result = await put<ApiResponse<{ task: Task }>>(
    `/tasks/${id}`,
    payload,
    token
  );
  return result.data.task;
};

// ==========================================
// UPDATE TASK STATUS
// PATCH /api/tasks/:id/status
// ==========================================

export const updateTaskStatus = async (
  id: string,
  status: string,
  notes: string = "",
  token: string
): Promise<Task> => {
  if (!id) throw new Error("Task ID is required");

  const result = await patch<ApiResponse<{ task: Task }>>(
    `/tasks/${id}/status`,
    { status, notes },
    token
  );
  return result.data.task;
};

// ==========================================
// DELETE / CANCEL TASK
// DELETE /api/tasks/:id
// ==========================================

export const deleteTask = async (
  id: string,
  token: string
): Promise<DeleteTaskResponse> => {
  if (!id) throw new Error("Task ID is required");

  return del<DeleteTaskResponse>(`/tasks/${id}`, token);
};

// ==========================================
// UPLOAD VOICE RECORDING AUDIO BLOB
// POST /api/tasks/voice-upload
// ==========================================

export const uploadVoiceRecording = async (
  audioBlob: Blob,
  token: string,
  fileName: string = "recording.webm"
): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append("audio", audioBlob, fileName);

  const res = await fetch(`${API_BASE}/tasks/voice-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to upload audio recording");
  }

  return json.data;
};