const AUTH_STORAGE_KEYS = [
  "auth_token",
  "role",
  "user_id",
  "user_status",
  "company_status",
  "company_id",
] as const;

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

// Logout é client-side apenas: apaga o token local e redireciona.
// Sem endpoint no backend — blocklist de JWT é backlog pós-MVP.
export function logout() {
  clearAuthStorage();
  window.location.href = "/login";
}
