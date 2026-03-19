import type { ModuleDefinition } from "@zs/contracts";

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    module_key: "billing",
    name: "Facturacion",
    type: "external",
    status: "active",
    route: "/modules/facturacion",
    external_url: "https://facturas.zonasurtech.online",
    required_plan: "starter",
    health_endpoint: "https://facturas.zonasurtech.online/health"
  },
  {
    module_key: "sales",
    name: "Ventas",
    type: "native",
    status: "active",
    route: "/modules/ventas",
    external_url: null,
    required_plan: "starter"
  },
  {
    module_key: "inventory",
    name: "Inventario",
    type: "native",
    status: "active",
    route: "/modules/inventario",
    external_url: null,
    required_plan: "starter"
  },
  {
    module_key: "crm",
    name: "CRM",
    type: "native",
    status: "beta",
    route: "/modules/crm",
    external_url: null,
    required_plan: "growth"
  },
  {
    module_key: "chat",
    name: "Chat",
    type: "external",
    status: "disabled",
    route: "/modules/chat",
    external_url: "https://chat.zonasurtech.online",
    required_plan: "growth",
    health_endpoint: "https://chat.zonasurtech.online/health"
  },
  {
    module_key: "admin",
    name: "Admin",
    type: "external",
    status: "active",
    route: "/modules/admin",
    external_url: "https://cms.zonasurtech.online",
    required_plan: "internal",
    health_endpoint: "https://cms.zonasurtech.online/api/health"
  }
];

export function getModuleByKey(moduleKey: ModuleDefinition["module_key"]) {
  return MODULE_REGISTRY.find((item) => item.module_key === moduleKey) ?? null;
}

