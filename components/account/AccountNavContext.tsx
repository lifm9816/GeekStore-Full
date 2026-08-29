"use client";

/**
 * Contexto para breadcrumb dinámico en /account (ej. editar dirección).
 * Vive por encima de SiteHeader → AccountChrome.
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

export type AccountCrumbState = {
  label: string;
  backHref: string;
} | null;

type AccountNavContextValue = {
  crumb: AccountCrumbState;
  setCrumb: (crumb: AccountCrumbState) => void;
};

const AccountNavContext = createContext<AccountNavContextValue | null>(null);

export function AccountNavProvider({ children }: { children: ReactNode }) {
  const [crumb, setCrumbState] = useState<AccountCrumbState>(null);

  const setCrumb = useCallback((next: AccountCrumbState) => {
    setCrumbState(next);
  }, []);

  const value = useMemo(() => ({ crumb, setCrumb }), [crumb, setCrumb]);

  return (
    <AccountNavContext.Provider value={value}>
      {children}
    </AccountNavContext.Provider>
  );
}

export function useAccountNav() {
  const ctx = useContext(AccountNavContext);

  if (!ctx) {
    throw new Error("useAccountNav debe usarse dentro de AccountNavProvider.");
  }

  return ctx;
}

/** Fija el crumb del chrome al montar / al cambiar label; limpia al desmontar. */
export function AccountCrumb({
  label,
  backHref,
}: {
  label: string;
  backHref: string;
}) {
  const { setCrumb } = useAccountNav();

  useEffect(() => {
    setCrumb({ label, backHref });
    return () => setCrumb(null);
  }, [label, backHref, setCrumb]);

  return null;
}
