"use client";

/**
 * Tras login (Credentials o Google) fusiona el carrito de invitado en CartItem:
 * si el producto ya existe, suma cantidades (y recorta a stock); si no, crea.
 * Después borra localStorage para no volver a mergear las mismas líneas.
 */

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { mergeGuestCart } from "@/app/actions/cart";
import { clearGuestCart, getGuestCartItems, notifyCartCount } from "@/lib/cart-draft";

type CartMergeOnAuthProps = {
  signedIn: boolean;
};

export function CartMergeOnAuth({ signedIn }: CartMergeOnAuthProps) {
  const router = useRouter();
  const merging = useRef(false);

  useEffect(() => {
    if (!signedIn || merging.current) {
      return;
    }

    const items = getGuestCartItems();

    if (items.length === 0) {
      return;
    }

    merging.current = true;

    void mergeGuestCart(items)
      .then((result) => {
        if (result.ok) {
          clearGuestCart();
          if (typeof result.cartCount === "number") {
            notifyCartCount(result.cartCount);
          }
          router.refresh();
        }
      })
      .finally(() => {
        merging.current = false;
      });
  }, [signedIn, router]);

  return null;
}
