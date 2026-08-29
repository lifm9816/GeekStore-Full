"use client";

/**
 * Selector de dirección (mockup 02). Solo lista Address del Día 8 —
 * no duplicamos el formulario de alta aquí.
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AddressDTO } from "@/lib/account";

type AddressSelectorProps = {
  addresses: AddressDTO[];
  defaultAddressId?: string;
};

export function AddressSelector({
  addresses,
  defaultAddressId,
}: AddressSelectorProps) {
  const t = useTranslations("checkout");

  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5">
      <h2 className="mb-4 text-[15px] font-bold">{t("shippingTitle")}</h2>
      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">{t("shippingTitle")}</legend>
        {addresses.map((address) => (
          <label
            key={address.id}
            className="flex cursor-pointer gap-3 rounded-[10px] border border-gs-border p-4 transition-colors has-checked:border-gs-accent has-checked:bg-gs-accent/5"
          >
            <input
              type="radio"
              name="addressId"
              value={address.id}
              defaultChecked={
                defaultAddressId
                  ? address.id === defaultAddressId
                  : address.isDefault
              }
              required
              className="mt-1 h-4 w-4 shrink-0 accent-gs-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
            />
            <span>
              <span className="mb-1.5 inline-flex rounded-full bg-gs-surface-2 px-2.5 py-0.5 text-[11px] font-bold text-gs-muted">
                {address.isDefault
                  ? t("defaultPill", { label: address.label })
                  : address.label}
              </span>
              <span className="block text-sm font-semibold">{address.street}</span>
              <span className="block text-[13px] text-gs-muted">
                {t("addressLine", {
                  city: address.city,
                  state: address.state,
                  zip: address.zipCode,
                  country: address.country,
                })}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <Link
        href="/account/addresses?returnTo=/checkout"
        className="mt-3 inline-block text-sm font-semibold text-gs-accent hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
      >
        {t("manageAddresses")}
      </Link>
    </section>
  );
}
