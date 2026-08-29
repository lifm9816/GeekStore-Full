/**
 * Reglas puras del carrito (sin Prisma ni localStorage).
 *
 * El umbral de envío gratis no está escrito en el mockup 12, pero se deduce
 * de sus números: subtotal $3,850 + "te faltan $150" = $4,000 MXN.
 * El envío de pago es $99, igual que en el resumen del mockup.
 *
 * clampQuantity replica handleQuantityChange del CRA (ShoppingCard/index.js):
 * nunca se permite una cantidad mayor a Product.stock. Si el resultado sería
 * 0 o el stock está agotado, devolvemos 0 para que la UI quite o bloquee la línea.
 */

export const FREE_SHIPPING_THRESHOLD = 4000;
export const PAID_SHIPPING = 99;

export type CartLine = {
  productId: string;
  quantity: number;
  stock: number;
  name: string;
  price: number;
  coverImageUrl: string;
  brandName: string;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  remainingForFreeShipping: number;
  progressPercent: number;
  qualifiesForFreeShipping: boolean;
};

export function clampQuantity(quantity: number, stock: number) {
  if (!Number.isFinite(quantity) || stock <= 0) {
    return 0;
  }

  return Math.min(Math.max(1, Math.trunc(quantity)), stock);
}

export function cartTotals(lines: Pick<CartLine, "price" | "quantity">[]): CartTotals {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = lines.length === 0 || qualifiesForFreeShipping ? 0 : PAID_SHIPPING;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return {
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    remainingForFreeShipping,
    progressPercent,
    qualifiesForFreeShipping,
  };
}
