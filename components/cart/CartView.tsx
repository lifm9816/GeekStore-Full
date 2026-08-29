"use client";

/**
 * Hidrata el carrito según sesión:
 * - Invitado: localStorage → hydrateGuestCart (precios/stock vivos).
 * - Logueado: líneas que ya trajo el Server Component; las mutaciones van
 *   a CartItem vía Server Actions.
 *
 * Al agregar desde "también te puede interesar", CART_DRAFT_EVENT (guest) o
 * router.refresh() (sesión) vuelven a sincronizar la lista.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  hydrateGuestCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/app/actions/cart";
import { CartEmpty } from "@/components/cart/CartEmpty";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartRelated } from "@/components/cart/CartRelated";
import { CartSummary } from "@/components/cart/CartSummary";
import { Link } from "@/i18n/navigation";
import { cartTotals, clampQuantity, type CartLine } from "@/lib/cart";
import {
  CART_DRAFT_EVENT,
  getGuestCartItems,
  notifyCartCount,
  removeGuestCartItem,
  setGuestCartQuantity,
} from "@/lib/cart-draft";
import type { SerializedProduct } from "@/lib/products";

type CartViewProps = {
  signedIn: boolean;
  initialLines: CartLine[];
  initialRelated: SerializedProduct[];
};

export function CartView({
  signedIn,
  initialLines,
  initialRelated,
}: CartViewProps) {
  const t = useTranslations("cart");
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>(signedIn ? initialLines : []);
  const [related, setRelated] = useState<SerializedProduct[]>(
    signedIn ? initialRelated : [],
  );
  const [ready, setReady] = useState(signedIn);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const hydrateGuest = useCallback(async () => {
    const resolved = await hydrateGuestCart(getGuestCartItems());
    setLines(resolved.lines);
    setRelated(resolved.related);
    setReady(true);
  }, []);

  useEffect(() => {
    if (signedIn) {
      setLines(initialLines);
      setRelated(initialRelated);
      setReady(true);
      return;
    }

    if (getGuestCartItems().length === 0) {
      setLines([]);
      setRelated([]);
      setReady(true);
      return;
    }

    void hydrateGuest();
  }, [signedIn, initialLines, initialRelated, hydrateGuest]);

  useEffect(() => {
    function onDraftChange() {
      if (signedIn) {
        router.refresh();
        return;
      }

      const stored = getGuestCartItems();
      const currentLines = linesRef.current;
      const known = new Set(currentLines.map((line) => line.productId));
      const hasUnknown = stored.some((item) => !known.has(item.productId));

      if (hasUnknown) {
        void hydrateGuest();
        return;
      }

      setLines(
        currentLines
          .filter((line) =>
            stored.some((item) => item.productId === line.productId),
          )
          .map((line) => {
            const next = stored.find((item) => item.productId === line.productId);
            return next
              ? { ...line, quantity: clampQuantity(next.quantity, line.stock) }
              : line;
          }),
      );
    }

    window.addEventListener(CART_DRAFT_EVENT, onDraftChange);

    return () => {
      window.removeEventListener(CART_DRAFT_EVENT, onDraftChange);
    };
  }, [signedIn, hydrateGuest, router]);

  async function handleQuantityChange(productId: string, quantity: number) {
    const current = lines.find((line) => line.productId === productId);

    if (!current) {
      return;
    }

    const nextQuantity = clampQuantity(quantity, current.stock);

    if (nextQuantity <= 0) {
      await handleRemove(productId);
      return;
    }

    setLines((currentLines) =>
      currentLines.map((line) =>
        line.productId === productId
          ? { ...line, quantity: nextQuantity }
          : line,
      ),
    );

    if (!signedIn) {
      setGuestCartQuantity(productId, nextQuantity, current.stock);
      return;
    }

    setPendingId(productId);
    const result = await setCartItemQuantity(productId, nextQuantity);

    if (result.ok && typeof result.quantity === "number") {
      setLines((currentLines) =>
        currentLines.map((line) =>
          line.productId === productId
            ? { ...line, quantity: result.quantity ?? nextQuantity }
            : line,
        ),
      );
    }

    setPendingId(null);
    router.refresh();
  }

  async function handleRemove(productId: string) {
    setLines((currentLines) =>
      currentLines.filter((line) => line.productId !== productId),
    );

    if (!signedIn) {
      removeGuestCartItem(productId);
      return;
    }

    setPendingId(productId);
    await removeCartItem(productId);
    setPendingId(null);
    router.refresh();
  }

  const totals = cartTotals(lines);

  useEffect(() => {
    if (!ready) {
      return;
    }

    notifyCartCount(totals.itemCount);
  }, [ready, totals.itemCount]);

  if (!ready) {
    return (
      <p className="text-sm text-gs-muted" role="status">
        {t("loading")}
      </p>
    );
  }

  if (lines.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <h1 className="mb-4 text-lg font-extrabold md:text-xl">
            {t("title", { count: totals.itemCount })}
          </h1>
          <ul>
            {lines.map((line) => (
              <li key={line.productId}>
                <CartLineItem
                  line={line}
                  pending={pendingId === line.productId}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-1.5 inline-flex items-center text-sm font-bold text-gs-accent transition-colors hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            ← {t("keepShopping")}
          </Link>
        </div>

        <div className="w-full lg:max-w-sm lg:shrink-0">
          <CartSummary totals={totals} />
        </div>
      </div>

      <CartRelated products={related} />
    </div>
  );
}
