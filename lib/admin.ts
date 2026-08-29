/**
 * Helpers compartidos del panel admin (Días 12–13).
 * Gate de ruta vive en proxy + admin/layout; estas helpers refuerzan
 * Server Actions (defense in depth).
 */

import { auth } from "@/auth";

export const LOW_STOCK_THRESHOLD = 5;

export async function requireAdmin() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

/** slug URL-safe a partir de un nombre (marcas / categorías). */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
