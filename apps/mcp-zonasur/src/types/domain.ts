export type LeadInput = {
  name: string;
  phone: string;
  source?: string;
  notes?: string;
};

export type TaskInput = {
  title: string;
  assignedTo?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  context?: string;
};

export type DashboardSummary = {
  date: string;
  salesCount: number;
  salesRevenue: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
  }>;
};

export type BillingStatus = {
  tenantId: string;
  plan: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "unknown";
  currentPeriodEnd: string | null;
};

export type BillingPeriod = "today" | "this_week" | "this_month";
