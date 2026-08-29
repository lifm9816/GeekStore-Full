"use client";

/**
 * Agregar al carrito: invitado → localStorage; sesión → CartItem (Server Action).
 * Mientras useSession está en "loading" el botón se deshabilita para no escribir
 * en localStorage y, un instante después, mergear esas mismas unidades a DB.
 */

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { addCartItem } from "@/app/actions/cart";
import { addDraftCartItem, notifyCartCount } from "@/lib/cart-draft";

type AddToCartButtonProps = {
  productId: string;
  stock: number;
  quantity?: number;
  fullLabel?: boolean;
  tone?: "primary" | "ghost";
  className?: string;
};

export function AddToCartButton({
  productId,
  stock,
  quantity = 1,
  fullLabel = false,
  tone = "primary",
  className = "",
}: AddToCartButtonProps) {
  const t = useTranslations("product");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [added, setAdded] = useState(false);
  const soldOut = stock <= 0;
  const waitingSession = status === "loading";
  const toneClass =
    tone === "ghost"
      ? "bg-transparent text-gs-text ring-1 ring-gs-border hover:bg-gs-surface-2 disabled:bg-transparent disabled:text-gs-muted"
      : "bg-gs-accent text-gs-surface hover:bg-gs-accent-hover disabled:bg-gs-surface-2 disabled:text-gs-muted";

  async function handleAdd() {
    if (soldOut || waitingSession) {
      return;
    }

    if (session?.user) {
      const result = await addCartItem(productId, quantity);
      if (typeof result.cartCount === "number") {
        notifyCartCount(result.cartCount);
      }
      router.refresh();
    } else {
      addDraftCartItem(productId, quantity, stock);
    }

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={() => void handleAdd()}
      disabled={soldOut || waitingSession}
      className={`inline-flex items-center justify-center rounded-[7px] px-4 py-2.5 text-sm font-bold transition-colors active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:opacity-80 ${toneClass} ${className}`}
    >
      {soldOut ? t("soldOut") : added ? t("added") : fullLabel ? t("addToCartFull") : t("addToCart")}
    </button>
  );
}
