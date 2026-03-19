export type LaunchFailureCode =
  | "UNAUTHENTICATED"
  | "TENANT_REQUIRED"
  | "MODULE_DISABLED"
  | "FORBIDDEN"
  | "TOKEN_ISSUE_FAILED"
  | "INVALID_EXCHANGE_URL"
  | "NETWORK"
  | "UNKNOWN";

export function sanitizeRedirectPath(path?: string): string {
  if (!path) return "/dashboard";
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

export function assertBillingExchangeUrl(raw: string): string {
  const allowedOrigin = "https://facturas.zonasurtech.online";
  const url = new URL(raw);

  if (url.origin !== allowedOrigin) {
    throw new Error("INVALID_EXCHANGE_URL");
  }

  if (url.pathname !== "/auth/exchange") {
    throw new Error("INVALID_EXCHANGE_URL");
  }

  return url.toString();
}

export function mapModuleTokenError(code?: string): { title: string; detail: string; failure: LaunchFailureCode } {
  switch (code) {
    case "UNAUTHENTICATED":
      return {
        title: "Sesion expirada",
        detail: "Tu sesion del hub vencio. Inicia sesion nuevamente para abrir Facturacion.",
        failure: "UNAUTHENTICATED"
      };
    case "TENANT_REQUIRED":
      return {
        title: "Tenant requerido",
        detail: "Selecciona un negocio activo antes de abrir Facturacion.",
        failure: "TENANT_REQUIRED"
      };
    case "MODULE_DISABLED":
      return {
        title: "Modulo no disponible",
        detail: "Facturacion esta deshabilitada para tu plan actual. Ve a Billing para habilitarla.",
        failure: "MODULE_DISABLED"
      };
    case "FORBIDDEN":
      return {
        title: "Sin permisos",
        detail: "Tu rol no tiene acceso a este modulo para el tenant activo.",
        failure: "FORBIDDEN"
      };
    case "TENANT_MISMATCH":
      return {
        title: "Contexto invalido",
        detail: "El tenant activo no coincide. Vuelve a seleccionar tenant e intenta de nuevo.",
        failure: "TENANT_REQUIRED"
      };
    default:
      return {
        title: "No se pudo emitir el token",
        detail: "Ocurrio un error del launcher. Reintenta en unos segundos.",
        failure: "TOKEN_ISSUE_FAILED"
      };
  }
}

export function buildExchangeForm(input: {
  exchangeUrl: string;
  token: string;
  redirectPath: string;
}): HTMLFormElement {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = input.exchangeUrl;
  form.style.display = "none";

  const tokenInput = document.createElement("input");
  tokenInput.type = "hidden";
  tokenInput.name = "token";
  tokenInput.value = input.token;

  const redirectInput = document.createElement("input");
  redirectInput.type = "hidden";
  redirectInput.name = "redirect";
  redirectInput.value = "true";

  const redirectPathInput = document.createElement("input");
  redirectPathInput.type = "hidden";
  redirectPathInput.name = "redirect_path";
  redirectPathInput.value = input.redirectPath;

  form.appendChild(tokenInput);
  form.appendChild(redirectInput);
  form.appendChild(redirectPathInput);
  return form;
}
