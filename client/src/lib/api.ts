export const API_BASE = (((import.meta as any).env?.VITE_API_URL) ?? "").replace(/\/$/, "");
export const apiUrl = (path: string) => {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
};