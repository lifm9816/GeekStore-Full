/**
 * Identificador visible de orden (mockup 03 / 04: #GK-10432).
 * No es un campo de Prisma — recorte del cuid para UI consistente.
 */

export function formatOrderNumber(orderId: string) {
  return `#GK-${orderId.slice(-5).toUpperCase()}`;
}
