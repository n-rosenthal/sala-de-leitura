// frontend/services/server-api.ts
import "server-only";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://backend:8000";

/**
 * API para uso em Server Components
 * - Cookies são enviados automaticamente
 * - NÃO usar em Client Components
 */
const serverApi = {
  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      credentials: "include",
      cache: "no-store", // evita cache indevido
    });

    if (!res.ok) {
      throw new Error(`Server API error: ${res.status}`);
    }

    return res.json();
  },
};

export default serverApi;
