export type Role = "Admin" | "Seller" | "Buyer";
const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function saveAuth(token: string, role: Role){
  if (!hasStorage()) return;
  window.localStorage.setItem("token", token)
  window.localStorage.setItem("role", role)
}

export function clearAuth() {
  if (!hasStorage()) return;
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("role");
}

export function getToken() {
  if (!hasStorage()) return null;
  return window.localStorage.getItem("token");
}

export function getRole(): Role | null {
  if (!hasStorage()) return null;
  return (window.localStorage.getItem("role") as Role) ?? null;
}

export function isLoggedIn() {
  return !!getToken();
}
