"use client";

/**
 * Contexto para el label del breadcrumb en /product/[id].
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ProductCrumbState = {
  label: string;
} | null;

type ProductNavContextValue = {
  crumb: ProductCrumbState;
  setCrumb: (crumb: ProductCrumbState) => void;
};

const ProductNavContext = createContext<ProductNavContextValue | null>(null);

export function ProductNavProvider({ children }: { children: ReactNode }) {
  const [crumb, setCrumbState] = useState<ProductCrumbState>(null);

  const setCrumb = useCallback((next: ProductCrumbState) => {
    setCrumbState(next);
  }, []);

  const value = useMemo(() => ({ crumb, setCrumb }), [crumb, setCrumb]);

  return (
    <ProductNavContext.Provider value={value}>
      {children}
    </ProductNavContext.Provider>
  );
}

export function useProductNav() {
  const ctx = useContext(ProductNavContext);

  if (!ctx) {
    throw new Error("useProductNav debe usarse dentro de ProductNavProvider.");
  }

  return ctx;
}

export function ProductCrumb({ label }: { label: string }) {
  const { setCrumb } = useProductNav();

  useEffect(() => {
    setCrumb({ label });
    return () => setCrumb(null);
  }, [label, setCrumb]);

  return null;
}
