/**
 * Carrito de invitado: solo vive en localStorage.
 *
 * No se crea CartItem sin userId (el schema exige FK a User). Al iniciar
 * sesión, CartMergeOnAuth lee estas líneas, las fusiona en DB y llama a
 * clearGuestCart().
 *
 * La clave se reutiliza del draft anterior, que estaba en sessionStorage
 * (se perdía al cerrar la pestaña). Si queda un valor viejo ahí, se migra
 * una vez a localStorage.
 */

import { clampQuantity } from "@/lib/cart";

export type DraftCartItem = {
  productId: string;
  quantity: number;
};

const KEY = "geekstore.cart-draft";
export const CART_DRAFT_EVENT = "geekstore:cart-draft";
export const CART_COUNT_EVENT = "geekstore:cart-count";

function notifyCartDraft() {
  window.dispatchEvent(new Event(CART_DRAFT_EVENT));
}

export function notifyCartCount(count: number) {
  window.dispatchEvent(new CustomEvent(CART_COUNT_EVENT, { detail: count }));
}

function persist(items: DraftCartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  notifyCartDraft();
  notifyCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
}

function readItems(): DraftCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  let raw = localStorage.getItem(KEY);

  if (!raw) {
    const legacy = sessionStorage.getItem(KEY);
    if (legacy) {
      localStorage.setItem(KEY, legacy);
      sessionStorage.removeItem(KEY);
      raw = legacy;
    }
  }

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as DraftCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getGuestCartItems() {
  return readItems();
}

export function addDraftCartItem(
  productId: string,
  quantity: number,
  stock: number,
) {
  if (stock <= 0) {
    return;
  }

  const safeQuantity = clampQuantity(quantity, stock);
  const items = readItems();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity = clampQuantity(existing.quantity + safeQuantity, stock);
  } else {
    items.push({ productId, quantity: safeQuantity });
  }

  persist(items);
}

export function setGuestCartQuantity(
  productId: string,
  quantity: number,
  stock: number,
) {
  const items = readItems();
  const nextQuantity = clampQuantity(quantity, stock);

  if (nextQuantity <= 0) {
    persist(items.filter((item) => item.productId !== productId));
    return;
  }

  persist(
    items.map((item) =>
      item.productId === productId ? { ...item, quantity: nextQuantity } : item,
    ),
  );
}

export function removeGuestCartItem(productId: string) {
  persist(readItems().filter((item) => item.productId !== productId));
}

export function clearGuestCart() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  notifyCartDraft();
  notifyCartCount(0);
}

export function getDraftCartCount() {
  return readItems().reduce((sum, item) => sum + item.quantity, 0);
}
