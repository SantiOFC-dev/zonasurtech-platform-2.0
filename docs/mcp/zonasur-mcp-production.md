# 1. Resumen

Este diseño agrega un MCP server productivo para ZonaSurTech en `apps/mcp-zonasur`, con:

- `tools` de negocio reales (dashboard, leads, stock, tareas, ventas y billing).
- capa de servicios separada de transporte MCP.
- conexión segura a Supabase con `service_role`.
- seguridad base: API key obligatoria, rate limiting, CORS allowlist, headers seguros, request-id, logs estructurados.
- despliegue con Docker + reverse proxy Nginx en EC2.

# 2. Configuración

## 2.1 `~/.codex/config.toml` (propuesta completa)

```toml
model = "gpt-5-codex"
model_reasoning_effort = "high"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[execution]
command_timeout_ms = 120000
network_access = "restricted"

[security]
redact_env = true
log_prompts = false
max_file_read_kb = 512

[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@latest"]
startup_timeout_ms = 20000
tool_timeout_ms = 45000

[mcp_servers.openai_docs]
command = "npx"
args = ["-y", "@openai/docs-mcp@latest"]
startup_timeout_ms = 20000
tool_timeout_ms = 45000

[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
startup_timeout_ms = 30000
tool_timeout_ms = 120000

[mcp_servers.zonasur]
url = "http://localhost:3005/mcp"
startup_timeout_ms = 15000
tool_timeout_ms = 30000

[mcp_servers.zonasur.headers]
x-api-key = "${MCP_API_KEY}"
x-tenant-id = "tenant_default"
```

## 2.2 Registro MCP por CLI (ejemplos)

```bash
codex mcp add context7 --command "npx" --args "-y,@upstash/context7-mcp@latest"
codex mcp add openai_docs --command "npx" --args "-y,@openai/docs-mcp@latest"
codex mcp add playwright --command "npx" --args "-y,@playwright/mcp@latest"
codex mcp add zonasur --url "http://localhost:3005/mcp" --header "x-api-key=${MCP_API_KEY}"
```

## 2.3 Configuración MCP del SaaS

```toml
[mcp_servers.zonasur]
url = "http://localhost:3005/mcp"
startup_timeout_ms = 15000
tool_timeout_ms = 30000

[mcp_servers.zonasur.headers]
x-api-key = "${MCP_API_KEY}"
x-tenant-id = "tenant_default"
```

Recomendaciones:

- usar `https://mcp.zonasurtech.com/mcp` en producción.
- rotar `MCP_API_KEY` periódicamente.
- restringir IPs en SG/NACL de AWS para origen de agentes autorizados.
- agregar mTLS o API Gateway + WAF cuando crezca tráfico B2B.

# 3. Código

## 3.1 Estructura de carpetas

```text
apps/mcp-zonasur/
  .env.example
  Dockerfile
  package.json
  tsconfig.json
  src/
    server.ts
    config/
      env.ts
      logger.ts
    clients/
      supabase.ts
    errors/
      app-error.ts
    middleware/
      api-key-auth.ts
      error-handler.ts
      request-context.ts
    services/
      business.service.ts
      tenant.service.ts
    tools/
      register-tools.ts
    types/
      domain.ts
      express.d.ts
docker-compose.mcp.yml
infra/nginx/mcp-zonasur.conf
```

## 3.2 Tools implementadas

- `get_dashboard_summary`
- `create_lead`
- `list_low_stock_products`
- `create_task`
- `get_sales_today`
- `get_billing_status`

## 3.3 Respuestas JSON de ejemplo

```json
{
  "content": [
    {
      "type": "text",
      "text": "Dashboard summary generated"
    }
  ],
  "structuredContent": {
    "date": "2026-03-18",
    "salesCount": 27,
    "salesRevenue": 18450.75,
    "lowStockProducts": [
      {
        "id": "prod_12",
        "name": "Cable CAT6",
        "stock": 3,
        "minStock": 8
      }
    ]
  }
}
```

```json
{
  "content": [
    {
      "type": "text",
      "text": "Lead created"
    }
  ],
  "structuredContent": {
    "leadId": "lead_7f81",
    "createdAt": "2026-03-18T21:47:03.888Z"
  }
}
```

## 3.4 Supabase (service layer)

La conexión usa `SUPABASE_SERVICE_ROLE_KEY` en servidor, nunca en frontend.
Todas las queries viven en `services/business.service.ts`, no en el transporte MCP.

Tablas esperadas:

- `sales(tenant_id, created_at, total_amount, status)`
- `products(tenant_id, id, name, stock, min_stock)`
- `leads(tenant_id, id, name, phone, source, created_at)`
- `tasks(tenant_id, id, title, assigned_to, status, created_at)`
- `billing_accounts(tenant_id, plan, status, current_period_end)`

# 4. Pasos de implementación

1. Copiar variables:

```bash
cp apps/mcp-zonasur/.env.example apps/mcp-zonasur/.env
```

2. Completar secretos en `.env`:
- `MCP_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Instalar dependencias:

```bash
pnpm install
```

4. Validar tipos:

```bash
pnpm run typecheck:mcp
```

5. Ejecutar local:

```bash
pnpm run dev:mcp
```

6. Probar salud:

```bash
curl -H "x-api-key: TU_KEY" http://localhost:3005/healthz
```

7. Despliegue Docker en EC2:

```bash
docker compose -f docker-compose.mcp.yml up -d --build
```

8. Activar Nginx:
- copiar `infra/nginx/mcp-zonasur.conf` a `/etc/nginx/conf.d/`.
- verificar sintaxis y recargar:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

# 5. Resultado esperado

- Codex/LLM puede usar Context7 y OpenAI docs para documentación actualizada.
- Playwright MCP permite testing E2E real sobre UI.
- MCP ZonaSur expone herramientas operativas del SaaS con validación y respuestas estructuradas.
- la base queda lista para evolucionar a multi-agente con separación clara entre transporte MCP y lógica de dominio.

## Prompts reales de uso del agente

1. Crear lead automáticamente:
`Usa create_lead con name='Carlos Mena', phone='+50688887777', source='landing_facebook' y confirma el id generado.`

2. Revisar errores del sistema:
`Consulta get_dashboard_summary y get_billing_status; si hay caída de ingresos o billing past_due, resume causa probable y crea task de seguimiento.`

3. Validar flujo de ventas:
`Ejecuta get_sales_today y compáralo contra promedio semanal (si hay brecha >20%, reporta alerta).`

4. Analizar dashboard:
`Trae get_dashboard_summary y genera un resumen ejecutivo para operaciones (ventas, ingresos, stock crítico).`

5. Detectar problemas de stock:
`Ejecuta list_low_stock_products, agrupa por criticidad y crea task para los 3 productos con menor stock.`

## Seguridad y mejores prácticas

- No exponer `SUPABASE_SERVICE_ROLE_KEY`:
  solo en backend/MCP, en AWS Secrets Manager o SSM Parameter Store.
- Limitar tools MCP:
  registrar únicamente tools necesarias por rol y entorno (prod vs staging).
- RBAC:
  mapear `x-agent-role` o claims JWT a allowlist de tools (ej. `ops_agent` no puede crear billing tasks administrativas).
- Logging y auditoría:
  guardar `requestId`, `toolName`, `tenantId`, latencia, resultado y actor.
- Rate limiting:
  por API key + por IP (Nginx + app) para bloquear abuso y loops de agentes.
