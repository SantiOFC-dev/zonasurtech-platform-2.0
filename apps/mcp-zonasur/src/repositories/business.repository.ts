import { supabaseAdmin } from "../clients/supabase.js";
import { fromSupabaseError } from "../errors/app-error.js";

export class BusinessRepository {
  async getCompletedSalesInRange(tenantId: string, start: string, end: string): Promise<Array<{ totalAmount: number }>> {
    const { data, error } = await supabaseAdmin
      .from("sales")
      .select("total_amount")
      .eq("tenant_id", tenantId)
      .eq("status", "completed")
      .gte("created_at", start)
      .lte("created_at", end);

    if (error) {
      throw fromSupabaseError(error);
    }

    return (data ?? []).map((row) => ({
      totalAmount: Number(row.total_amount ?? 0)
    }));
  }

  async getLowStockProducts(
    tenantId: string,
    threshold: number
  ): Promise<Array<{ id: string; name: string; stock: number; minStock: number }>> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id,name,stock,min_stock")
      .eq("tenant_id", tenantId)
      .lte("stock", threshold)
      .order("stock", { ascending: true })
      .limit(50);

    if (error) {
      throw fromSupabaseError(error);
    }

    return (data ?? []).map((product) => ({
      id: String(product.id),
      name: String(product.name),
      stock: Number(product.stock ?? 0),
      minStock: Number(product.min_stock ?? 0)
    }));
  }

  async insertLead(
    tenantId: string,
    input: { name: string; phone: string; source?: string; notes?: string }
  ): Promise<{ id: string; createdAt: string }> {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        tenant_id: tenantId,
        name: input.name,
        phone: input.phone,
        source: input.source ?? "manual",
        notes: input.notes ?? null
      })
      .select("id,created_at")
      .single();

    if (error) {
      throw fromSupabaseError(error);
    }

    return {
      id: String(data.id),
      createdAt: String(data.created_at)
    };
  }

  async insertTask(
    tenantId: string,
    input: {
      title: string;
      assignedTo?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
      context?: string;
    }
  ): Promise<{ id: string; status: string; createdAt: string }> {
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        tenant_id: tenantId,
        title: input.title,
        assigned_to: input.assignedTo ?? null,
        due_date: input.dueDate ?? null,
        priority: input.priority ?? "medium",
        context: input.context ?? null,
        status: "pending"
      })
      .select("id,status,created_at")
      .single();

    if (error) {
      throw fromSupabaseError(error);
    }

    return {
      id: String(data.id),
      status: String(data.status),
      createdAt: String(data.created_at)
    };
  }

  async getBillingStatus(tenantId: string): Promise<{ plan: string; status: string; currentPeriodEnd: string | null } | null> {
    const { data, error } = await supabaseAdmin
      .from("billing_accounts")
      .select("plan,status,current_period_end")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) {
      throw fromSupabaseError(error);
    }

    if (!data) {
      return null;
    }

    return {
      plan: String(data.plan ?? "unknown"),
      status: String(data.status ?? "unknown"),
      currentPeriodEnd: data.current_period_end ? String(data.current_period_end) : null
    };
  }
}
