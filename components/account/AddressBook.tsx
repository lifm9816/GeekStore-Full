"use client";

/**
 * Mockup 05: lista + formulario. Editar rellena el form; el dashed card
 * vuelve al modo "nueva". Marcar predeterminada desmarca las demás en DB.
 */

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/app/actions/address";
import { AccountField } from "@/components/account/AccountField";
import { useAccountNav } from "@/components/account/AccountNavContext";
import type { AddressDTO } from "@/lib/account";
import type { AddressFormState } from "@/lib/validations/address";

type AddressBookProps = {
  addresses: AddressDTO[];
  /** Tras guardar, vuelve al checkout u otra ruta interna permitida. */
  returnTo?: string;
};

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
    </svg>
  );
}

export function AddressBook({ addresses, returnTo }: AddressBookProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState<AddressDTO | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pendingAction, startTransition] = useTransition();
  const [createState, createAction, createPending] = useActionState<
    AddressFormState | undefined,
    FormData
  >(createAddress, undefined);
  const [updateState, updateAction, updatePending] = useActionState<
    AddressFormState | undefined,
    FormData
  >(updateAddress, undefined);

  const state = editing ? updateState : createState;
  const pending = editing ? updatePending : createPending;
  const { setCrumb, crumb } = useAccountNav();
  const prevCrumbRef = useRef(crumb);

  useEffect(() => {
    if (!editing) {
      setCrumb(null);
      return;
    }

    setCrumb({
      label: editing.label,
      backHref: "/account/addresses",
    });
  }, [editing, setCrumb]);

  // ← Volver en el chrome: crumb pasa de valor → null (no confundir con el primer render).
  useEffect(() => {
    const previous = prevCrumbRef.current;
    prevCrumbRef.current = crumb;

    if (previous && !crumb && editing) {
      setEditing(null);
      setConfirmId(null);
      formRef.current?.reset();
    }
  }, [crumb, editing]);

  useEffect(() => {
    if (createState?.ok || updateState?.ok) {
      setEditing(null);
      formRef.current?.reset();

      if (returnTo) {
        router.push(returnTo);
      }
    }
  }, [createState, updateState, returnTo, router]);

  function startCreate() {
    setEditing(null);
    setConfirmId(null);
    formRef.current?.reset();
    window.setTimeout(() => document.getElementById("address-label")?.focus(), 0);
  }

  function startEdit(address: AddressDTO) {
    setEditing(address);
    setConfirmId(null);
    window.setTimeout(() => document.getElementById("address-label")?.focus(), 0);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <section>
        <h2 className="mb-4 text-[15px] font-bold">{t("savedAddresses")}</h2>
        {addresses.length === 0 ? (
          <p className="mb-4 text-sm text-gs-muted">{t("addressesEmpty")}</p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="rounded-[10px] border border-gs-border bg-gs-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        address.isDefault
                          ? "bg-gs-accent/15 text-gs-accent-strong"
                          : "bg-gs-surface-2 text-gs-muted"
                      }`}
                    >
                      {address.isDefault
                        ? t("defaultPill", { label: address.label })
                        : address.label}
                    </span>
                    {!address.isDefault ? (
                      <button
                        type="button"
                        disabled={pendingAction}
                        onClick={() =>
                          startTransition(() => {
                            void setDefaultAddress(address.id);
                          })
                        }
                        className="text-[12px] font-semibold text-gs-accent hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                      >
                        {t("makeDefault")}
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2.5 text-sm font-semibold">{address.street}</p>
                  <p className="text-[13px] text-gs-muted">
                    {t("addressLine", {
                      city: address.city,
                      state: address.state,
                      zip: address.zipCode,
                      country: address.country,
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    aria-label={t("editAddress", { label: address.label })}
                    className="rounded-[7px] p-2 text-gs-muted transition-colors hover:bg-gs-surface-2 hover:text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                  >
                    <PencilIcon />
                  </button>
                  {confirmId === address.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={pendingAction}
                        onClick={() =>
                          startTransition(() => {
                            void deleteAddress(address.id).then(() =>
                              setConfirmId(null),
                            );
                          })
                        }
                        className="rounded-[7px] px-2 py-1 text-[12px] font-bold text-gs-critical hover:bg-gs-critical/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                      >
                        {t("confirmDelete")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-[7px] px-2 py-1 text-[12px] font-semibold text-gs-muted hover:text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(address.id)}
                      aria-label={t("deleteAddress", { label: address.label })}
                      className="rounded-[7px] p-2 text-gs-critical transition-colors hover:bg-gs-critical/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={startCreate}
          className="mt-3 flex h-[52px] w-full items-center justify-center rounded-[10px] border border-dashed border-gs-border text-sm font-semibold text-gs-muted transition-colors hover:border-gs-accent hover:text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          {t("addAddress")}
        </button>
      </section>

      <section>
        <h2 className="mb-4 text-[15px] font-bold">
          {editing ? t("editAddressTitle") : t("newAddress")}
        </h2>
        <form
          ref={formRef}
          key={editing?.id ?? "new"}
          action={editing ? updateAction : createAction}
          className="rounded-[10px] border border-gs-border bg-gs-surface p-5"
        >
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="flex flex-col gap-3">
            <AccountField
              id="address-label"
              name="label"
              label={t("fields.label")}
              placeholder={t("placeholders.label")}
              defaultValue={editing?.label}
              errors={state?.fieldErrors?.label}
            />
            <AccountField
              id="address-street"
              name="street"
              autoComplete="street-address"
              label={t("fields.street")}
              placeholder={t("placeholders.street")}
              defaultValue={editing?.street}
              errors={state?.fieldErrors?.street}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AccountField
                id="address-city"
                name="city"
                autoComplete="address-level2"
                label={t("fields.city")}
                placeholder={t("placeholders.city")}
                defaultValue={editing?.city}
                errors={state?.fieldErrors?.city}
              />
              <AccountField
                id="address-state"
                name="state"
                autoComplete="address-level1"
                label={t("fields.state")}
                placeholder={t("placeholders.state")}
                defaultValue={editing?.state}
                errors={state?.fieldErrors?.state}
              />
              <AccountField
                id="address-zip"
                name="zipCode"
                autoComplete="postal-code"
                label={t("fields.zipCode")}
                placeholder={t("placeholders.zipCode")}
                defaultValue={editing?.zipCode}
                errors={state?.fieldErrors?.zipCode}
              />
              <AccountField
                id="address-country"
                name="country"
                autoComplete="country-name"
                label={t("fields.country")}
                placeholder={t("placeholders.country")}
                defaultValue={editing?.country ?? t("placeholders.country")}
                errors={state?.fieldErrors?.country}
              />
            </div>
            <label className="mt-1 flex items-center gap-2 text-[13px] text-gs-muted">
              <input
                type="checkbox"
                name="isDefault"
                defaultChecked={editing?.isDefault ?? addresses.length === 0}
                className="h-4 w-4 rounded border-gs-border accent-gs-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
              />
              {t("setDefault")}
            </label>
            {state?.error ? (
              <p role="alert" className="text-sm text-gs-critical">
                {state.error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:opacity-80"
            >
              {pending ? t("saving") : t("saveAddress")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
