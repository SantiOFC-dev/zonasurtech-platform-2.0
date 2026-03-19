# zonasurtech-platform

Hub SaaS central para Zona Sur Tech.

## Objetivo
- Login central y selección de tenant.
- Shell de dashboard y módulo registry.
- Integración de módulos externos (facturación/chat) con token exchange.

## Apps
- `apps/web`: Hub en Next.js App Router.

## Packages
- `packages/contracts`: Tipos y contratos de integración hub-módulos.
- `packages/module-registry`: Catálogo de módulos y capacidades.
- `packages/design-tokens`: Tokens visuales base.

## Infra
- `infra/sql`: esquema inicial multi-tenant.
- `infra/nginx`: mapeo de subdominios.

## Nota
Source of truth operativo:
- Core SaaS: `SaaS-Zona_Sur_Tech`
- Facturación: `fac-zona-sur-main`
- Chat: `zonasur-chat`
- Admin interno: `CMS-server`
