export type Role = "Admin" | "Seller" | "Buyer";
const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function saveAuth(token: string, role: Role, userId?: string){
  if (!hasStorage()) return;
  window.localStorage.setItem("token", token)
  window.localStorage.setItem("role", role)
  if (userId) {
    window.localStorage.setItem("userId", userId)
  }
}

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
  }
}

export function getToken() {
  if (!hasStorage()) return null;
  return window.localStorage.getItem("token");
}

export function getRole(): Role | null {
  if (!hasStorage()) return null;
  return (window.localStorage.getItem("role") as Role) ?? null;
}

export function getUserId(): string | null {
  if (!hasStorage()) return null;
  const storedId = window.localStorage.getItem("userId");
  if (storedId) return storedId;

  const token = getToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const uid =
      payload.sub ||
      payload.nameid ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      null;
    if (uid) {
      window.localStorage.setItem("userId", uid);
    }
    return uid;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}
