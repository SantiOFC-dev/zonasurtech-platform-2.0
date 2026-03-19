import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "./supabase/server";

export type CoreSalesItem = {
  id: string;
  saleNumber?: string;
  total: string | number;
  status: string;
  createdAt: string;
  paymentMethod?: string | null;
};

export type CoreLeadItem = {
  id: string;
  status: "new" | "contacted" | "qualified" | "lost" | "converted" | string;
  firstName?: string;
  lastName?: string;
};

export type CoreSummary = {
  totalProducts: number;
  totalRevenue: string;
  totalSales: number;
  lowStockCount: number;
  lowStockItems: Array<{ id: string; name: string; currentQuantity: string | number }>;
  revenueHistory: Array<{ date: string; amount: string }>;
};

export type DashboardSnapshot = {
  salesTodayAmount: number;
  salesTodayCount: number;
  lowStockCount: number;
  lowStockItems: Array<{ id: string; name: string; currentQuantity: string }>;
  openLeadsCount: number;
  openTasksCount: number;
  billingEnabled: boolean;
  billingStatusLabel: string;
};

export type SalesFilters = {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
};

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function startOfTodayIso(): string {
  const now = new Date();
  const localStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return localStart.toISOString();
}

function isBillingEnabledForPlan(planId: string): boolean {
  return ["starter", "growth", "pro"].includes(planId);
}

export async function getCoreAccessToken(): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

async function fetchCore<T>(input: {
  path: string;
  token: string;
  organizationId: string;
}): Promise<T> {
  const baseUrl = process.env.CORE_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("CORE_API_URL is not configured");
  }

  const response = await fetch(`${baseUrl}${input.path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${input.token}`,
      "X-Organization-Id": input.organizationId,
      "X-Request-Id": randomUUID(),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CORE_API_ERROR_${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getCoreSales(input: {
  token: string;
  organizationId: string;
}): Promise<CoreSalesItem[]> {
  return fetchCore<CoreSalesItem[]>({
    path: "/erp/sales",
    token: input.token,
    organizationId: input.organizationId,
  });
}

export function filterSales(items: CoreSalesItem[], filters: SalesFilters): CoreSalesItem[] {
  const query = (filters.q ?? "").trim().toLowerCase();
  const status = (filters.status ?? "all").toLowerCase();
  const fromDate = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
  const toDate = filters.to ? new Date(`${filters.to}T23:59:59`) : null;

  return items.filter((item) => {
    const createdAt = new Date(item.createdAt);

    if (status !== "all" && item.status.toLowerCase() !== status) return false;

    if (query) {
      const number = (item.saleNumber ?? "").toLowerCase();
      const payment = (item.paymentMethod ?? "").toLowerCase();
      if (!number.includes(query) && !payment.includes(query)) return false;
    }

    if (fromDate && createdAt < fromDate) return false;
    if (toDate && createdAt > toDate) return false;

    return true;
  });
}

export async function getDashboardSnapshot(input: {
  token: string;
  organizationId: string;
  planId: string;
}): Promise<DashboardSnapshot> {
  const [summaryResult, salesResult, leadsResult] = await Promise.allSettled([
    fetchCore<CoreSummary>({
      path: "/erp/dashboard/summary",
      token: input.token,
      organizationId: input.organizationId,
    }),
    fetchCore<CoreSalesItem[]>({
      path: "/erp/sales",
      token: input.token,
      organizationId: input.organizationId,
    }),
    fetchCore<CoreLeadItem[]>({
      path: "/erp/leads",
      token: input.token,
      organizationId: input.organizationId,
    }),
  ]);

  const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
  const sales = salesResult.status === "fulfilled" ? salesResult.value : [];
  const leads = leadsResult.status === "fulfilled" ? leadsResult.value : [];

  const todayStartIso = startOfTodayIso();
  const salesToday = sales.filter((sale) => {
    if (sale.status !== "completed") return false;
    return new Date(sale.createdAt).toISOString() >= todayStartIso;
  });

  const salesTodayAmount = salesToday.reduce((acc, item) => acc + toNumber(item.total), 0);
  const salesTodayCount = salesToday.length;

  const lowStockItems = (summary?.lowStockItems ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    currentQuantity: String(item.currentQuantity),
  }));

  const openLeads = leads.filter((lead) => !["lost", "converted"].includes(lead.status));
  const followUpLeads = leads.filter((lead) => ["new", "contacted", "qualified"].includes(lead.status));

  const billingEnabled = isBillingEnabledForPlan(input.planId);

  return {
    salesTodayAmount,
    salesTodayCount,
    lowStockCount: summary?.lowStockCount ?? lowStockItems.length,
    lowStockItems,
    openLeadsCount: openLeads.length,
    openTasksCount: followUpLeads.length,
    billingEnabled,
    billingStatusLabel: billingEnabled ? "Disponible" : "No incluido en plan",
  };
}
