"use client";

/**
 * Contexto del panel admin: crumb, chrome de página (título/acciones) y sidebar.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type AdminCrumbState = {
  label: string;
  backHref: string;
} | null;

type AdminNavContextValue = {
  crumb: AdminCrumbState;
  setCrumb: (crumb: AdminCrumbState) => void;
  pageTitle: string | null;
  setPageTitle: (title: string | null) => void;
  toolbarActionsEl: HTMLElement | null;
  setToolbarActionsEl: (el: HTMLElement | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const AdminNavContext = createContext<AdminNavContextValue | null>(null);

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const [crumb, setCrumbState] = useState<AdminCrumbState>(null);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [toolbarActionsEl, setToolbarActionsEl] = useState<HTMLElement | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setCrumb = useCallback((next: AdminCrumbState) => {
    setCrumbState(next);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  const value = useMemo(
    () => ({
      crumb,
      setCrumb,
      pageTitle,
      setPageTitle,
      toolbarActionsEl,
      setToolbarActionsEl,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
    }),
    [
      crumb,
      setCrumb,
      pageTitle,
      toolbarActionsEl,
      sidebarOpen,
      toggleSidebar,
    ],
  );

  return (
    <AdminNavContext.Provider value={value}>{children}</AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  const ctx = useContext(AdminNavContext);

  if (!ctx) {
    throw new Error("useAdminNav debe usarse dentro de AdminNavProvider.");
  }

  return ctx;
}

/** Fija el crumb del header admin al montar; limpia al desmontar. */
export function AdminCrumb({
  label,
  backHref,
}: {
  label: string;
  backHref: string;
}) {
  const { setCrumb } = useAdminNav();

  useEffect(() => {
    setCrumb({ label, backHref });
    return () => setCrumb(null);
  }, [label, backHref, setCrumb]);

  return null;
}

/**
 * Mueve el título (y acciones opcionales) a la franja bajo el header admin.
 * En vistas de detalle el breadcrumb corto suele bastar; title es opcional.
 */
export function AdminPageHeader({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  const { setPageTitle, toolbarActionsEl } = useAdminNav();

  useLayoutEffect(() => {
    setPageTitle(title ?? null);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);

  return (
    <>
      {title ? <h1 className="sr-only">{title}</h1> : null}
      {children && toolbarActionsEl
        ? createPortal(children, toolbarActionsEl)
        : null}
    </>
  );
}
