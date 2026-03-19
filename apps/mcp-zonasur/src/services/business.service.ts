import type { BillingPeriod, BillingStatus, DashboardSummary, LeadInput, TaskInput } from "../types/domain.js";
import { BusinessRepository } from "../repositories/business.repository.js";
import { periodBounds, todayBounds } from "../utils/date.js";

export class BusinessService {
  constructor(private readonly repository = new BusinessRepository()) {}

  async getSalesToday(tenantId: string): Promise<{ date: string; salesCount: number; revenue: number }> {
    const { start, end, day } = todayBounds();
    const sales = await this.repository.getCompletedSalesInRange(tenantId, start, end);

    const salesCount = sales.length;
    const revenue = sales.reduce((sum, row) => sum + row.totalAmount, 0);

    return {
      date: day,
      salesCount,
      revenue
    };
  }

  async listLowStockProducts(tenantId: string): Promise<
    Array<{
      id: string;
      name: string;
      stock: number;
      minStock: number;
    }>
  > {
    return this.repository.getLowStockProducts(tenantId, 10);
  }

  async listLowStockProductsByThreshold(
    tenantId: string,
    threshold: number
  ): Promise<Array<{ id: string; name: string; stock: number; minStock: number }>> {
    return this.repository.getLowStockProducts(tenantId, threshold);
  }

  async createLead(tenantId: string, input: LeadInput): Promise<{ id: string; createdAt: string }> {
    return this.repository.insertLead(tenantId, input);
  }

  async createTask(tenantId: string, input: TaskInput): Promise<{ id: string; status: string; createdAt: string }> {
    return this.repository.insertTask(tenantId, input);
  }

  async getBillingStatus(tenantId: string, period?: BillingPeriod): Promise<BillingStatus & { period?: BillingPeriod }> {
    const status = await this.repository.getBillingStatus(tenantId);
    if (!status) {
      return {
        tenantId,
        plan: "unknown",
        status: "unknown",
        currentPeriodEnd: null,
        ...(period ? { period } : {})
      };
    }

    const statusValue = status.status as BillingStatus["status"];

    return {
      tenantId,
      plan: status.plan,
      status: ["active", "trialing", "past_due", "canceled"].includes(statusValue) ? statusValue : "unknown",
      currentPeriodEnd: status.currentPeriodEnd,
      ...(period ? { period } : {})
    };
  }

  async getDashboardSummary(tenantId: string): Promise<DashboardSummary> {
    const [sales, lowStockProducts] = await Promise.all([
      this.getSalesToday(tenantId),
      this.listLowStockProducts(tenantId)
    ]);

    return {
      date: sales.date,
      salesCount: sales.salesCount,
      salesRevenue: sales.revenue,
      lowStockProducts
    };
  }

  async getBillingSummaryForPeriod(tenantId: string, period: BillingPeriod): Promise<{
    period: BillingPeriod;
    status: BillingStatus;
    completedSales: number;
    totalRevenue: number;
  }> {
    const { start, end } = periodBounds(period);
    const [status, sales] = await Promise.all([
      this.getBillingStatus(tenantId, period),
      this.repository.getCompletedSalesInRange(tenantId, start, end)
    ]);

    return {
      period,
      status,
      completedSales: sales.length,
      totalRevenue: sales.reduce((sum, row) => sum + row.totalAmount, 0)
    };
  }
}
