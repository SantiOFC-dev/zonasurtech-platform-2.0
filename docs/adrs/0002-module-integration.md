# ADR-0002: Integración de módulos externos

## Estado
Aceptado

## Decisión
Integración por `token exchange` + redirect seguro.
No usar iframe como estrategia base.

## Contrato mínimo
Headers:
- Authorization: Bearer <access_token>
- X-Tenant-Id: <tenant_id>
- X-Module-Key: <module_key>
- X-Request-Id: <uuid>
