import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { BusinessService } from "../services/business.service.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { BillingPeriod } from "../types/domain.js";

const service = new BusinessService();

const toolResult = (action: string, message: string, data: unknown) => {
  const payload = {
    action,
    status: "success" as const,
    data,
    message
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
    structuredContent: payload
  };
};

const optionalString = z.string().trim().min(1).optional();

export const registerBusinessTools = (server: McpServer): void => {
  server.registerTool(
    "get_dashboard_summary",
    {
      description: "Retorna ventas del dia, ingresos y productos con stock bajo",
      inputSchema: z.object({})
    },
    async () => {
      const tenantId = env.DEFAULT_TENANT_ID;
      const summary = await service.getDashboardSummary(tenantId);
      return toolResult("get_dashboard_summary", "Dashboard summary generated", summary);
    }
  );

  server.registerTool(
    "create_lead",
    {
      description: "Crea un lead nuevo en el CRM",
      inputSchema: z.object({
        name: z.string().min(2),
        phone: z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, "phone format is invalid"),
        source: optionalString,
        notes: optionalString
      })
    },
    async ({ name, phone, source, notes }) => {
      const tenantId = env.DEFAULT_TENANT_ID;
      const lead = await service.createLead(tenantId, { name, phone, source, notes });
      return toolResult("create_lead", "Lead created", {
        leadId: lead.id,
        createdAt: lead.createdAt
      });
    }
  );

  server.registerTool(
    "list_low_stock_products",
    {
      description: "Lista productos con inventario bajo",
      inputSchema: z.object({
        threshold: z.coerce.number().int().positive().max(1000).optional()
      })
    },
    async ({ threshold }) => {
      const tenantId = env.DEFAULT_TENANT_ID;
      const products = threshold
        ? await service.listLowStockProductsByThreshold(tenantId, threshold)
        : await service.listLowStockProducts(tenantId);
      return toolResult("list_low_stock_products", "Low stock products listed", {
        threshold: threshold ?? 10,
        count: products.length,
        products
      });
    }
  );

  server.registerTool(
    "create_task",
    {
      description: "Crea una tarea operativa",
      inputSchema: z.object({
        title: z.string().min(3),
        assigned_to: optionalString,
        due_date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be YYYY-MM-DD")
          .optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        context: optionalString
      })
    },
    async ({ title, assigned_to, due_date, priority, context }) => {
      const tenantId = env.DEFAULT_TENANT_ID;
      const task = await service.createTask(tenantId, {
        title,
        assignedTo: assigned_to,
        dueDate: due_date,
        priority,
        context
      });
      return toolResult("create_task", "Task created", {
        taskId: task.id,
        status: task.status,
        createdAt: task.createdAt
      });
    }
  );

  server.registerTool(
    "get_sales_today",
    {
      description: "Consulta ventas e ingresos del dia actual",
      inputSchema: z.object({})
    },
    async () => {
      const tenantId = env.DEFAULT_TENANT_ID;
      const sales = await service.getSalesToday(tenantId);
      return toolResult("get_sales_today", "Sales today calculated", sales);
    }
  );

  server.registerTool(
    "get_billing_status",
    {
      description: "Obtiene el estado de facturacion actual",
      inputSchema: z.object({
        period: z.enum(["today", "this_week", "this_month"]).optional()
      })
    },
    async ({ period }) => {
      const tenantId = env.DEFAULT_TENANT_ID;
      const normalizedPeriod = period as BillingPeriod | undefined;
      const billing = normalizedPeriod
        ? await service.getBillingSummaryForPeriod(tenantId, normalizedPeriod)
        : await service.getBillingStatus(tenantId);
      return toolResult("get_billing_status", "Billing status loaded", billing);
    }
  );

  logger.info("Business MCP tools registered");
};
