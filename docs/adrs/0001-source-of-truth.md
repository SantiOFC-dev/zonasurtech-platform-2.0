# ADR-0001: Source of Truth por módulo

## Estado
Aceptado

## Decisión
- `SaaS-Zona_Sur_Tech`: core ERP, tenancy, API principal.
- `fac-zona-sur-main`: motor fiscal CR.
- `zonasur-chat`: chat/seguimiento.
- `CMS-server`: control plane interno.
- `SaaS-FULL-REFACTOR`: congelado.

## Consecuencia
Queda prohibido desarrollo paralelo del mismo módulo en dos repos.
