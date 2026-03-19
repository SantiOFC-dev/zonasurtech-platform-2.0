# Module token exchange contract (MVP)

## Hub endpoint
`POST /api/module-token`

Request:
```json
{
  "module_key": "billing",
  "tenant_id": "TENANT_UUID"
}
```

Success `201`:
```json
{
  "token_type": "Bearer",
  "token": "JWT",
  "expires_in": 120,
  "expires_at": "2026-03-18T20:00:00.000Z",
  "module_key": "billing",
  "exchange_url": "https://facturas.zonasurtech.online/auth/exchange"
}
```

Errors:
- `401 UNAUTHENTICATED`
- `400 TENANT_REQUIRED`
- `422 INVALID_PAYLOAD`
- `403 TENANT_MISMATCH | FORBIDDEN`
- `404 MODULE_NOT_FOUND`
- `409 MODULE_DISABLED`
- `500 SERVER_MISCONFIGURED`

JWT claims:
- `iss`, `aud`, `sub`, `tenant_id`, `tenant_slug`, `role`, `module_key`, `plan_id`, `jti`, `iat`, `exp`
- TTL: `120` seconds

## External module endpoint contract
`POST /auth/exchange`

Request:
```json
{
  "token": "JWT"
}
```

Validation rules:
- signature valid
- `iss` is `app.zonasurtech.online`
- `aud` is `zonasurtech-module`
- `exp` not expired
- `module_key` matches current module
- `jti` not used/revoked

Success `200`:
```json
{
  "access_token": "MODULE_SESSION_TOKEN",
  "expires_at": "2026-03-18T20:02:00.000Z",
  "user": { "id": "USER_UUID" },
  "tenant": { "id": "TENANT_UUID", "slug": "tenant-demo" }
}
```
