// ==========================================
// TASK STATUS & PRIORITY
// ==========================================

export type TaskStatus =
  | "TODO"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

// ==========================================
// TASK SUB-ENTITIES
// ==========================================

export interface TaskStaffMember {
  _id: string;
  name: string;
  username: string;
  email?: string;
  employeeId?: string;
  avatar?: string;
  department?: string;
  role?: string;
  phone?: string;
}

export interface TaskService {
  _id: string;
  name: string;
  category: string;
  basePrice?: number;
  unitLabel?: string;
  description?: string;
}

export interface TaskStockItem {
  _id: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  unit?: string;
  location?: string;
  imageUrl?: string;
}

export interface TaskRequiredEquipment {
  _id?: string;
  item: string | TaskStockItem;
  quantity: number;
  notes?: string;
}

export interface TaskVoiceRecording {
  url: string;
  duration?: number;
  format?: string;
  transcribedText?: string;
}

export interface TaskAttachment {
  _id?: string;
  name: string;
  url: string;
  fileType?: string;
  size?: number;
}

export interface TaskStatusHistoryItem {
  _id?: string;
  status: string;
  changedBy?: {
    _id: string;
    name: string;
    username: string;
    role?: string;
  } | null;
  changedAt: string;
  notes?: string;
}

// ==========================================
// TASK ROOT MODEL
// ==========================================

export interface Task {
  _id: string;
  title: string;
  description: string;
  taskDate: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  service?: string | TaskService | null;
  assignedStaff: TaskStaffMember[];
  requiredEquipment: TaskRequiredEquipment[];
  voiceRecording?: TaskVoiceRecording;
  attachments: TaskAttachment[];
  estimatedExpenses: number;
  location: string;
  notes: string;
  createdBy?: {
    _id: string;
    name: string;
    username: string;
    role?: string;
    email?: string;
  } | null;
  completedAt?: string | null;
  statusHistory?: TaskStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PAYLOADS & RESPONSES
// ==========================================

export interface CreateTaskPayload {
  title: string;
  description?: string;
  taskDate?: string;
  dueDate: string;
  dueTime?: string;
  priority?: TaskPriority;
  service?: string | null;
  assignedStaff?: string[];
  requiredEquipment?: Array<{
    item: string;
    quantity: number;
    notes?: string;
  }>;
  voiceRecording?: TaskVoiceRecording;
  attachments?: TaskAttachment[];
  estimatedExpenses?: number;
  location?: string;
  notes?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  taskDate?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  service?: string | null;
  assignedStaff?: string[];
  requiredEquipment?: Array<{
    item: string;
    quantity: number;
    notes?: string;
  }>;
  voiceRecording?: TaskVoiceRecording;
  attachments?: TaskAttachment[];
  estimatedExpenses?: number;
  location?: string;
  notes?: string;
  statusNotes?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  service?: string;
  assignedStaff?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListResponse {
  success: boolean;
  data: Task[];
  pagination: TaskPagination;
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data: {
    task: Task;
  };
}

export interface DeleteTaskResponse {
  success: boolean;
  message?: string;
}