export interface Expense {
  _id: string;
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  notes?: string;
  task?: string;
  taskId?: string;
  createdAt?: string;
  updatedAt?: string;
}
