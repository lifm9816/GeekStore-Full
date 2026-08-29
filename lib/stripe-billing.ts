/**
 * Billing address para Stripe confirmPayment cuando el Payment Element
 * tiene fields.billingDetails.address = "never" (dirección ya elegida en checkout).
 */

import type { AddressDTO } from "@/lib/account";

export type StripeBillingAddress = {
  country: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
};

const COUNTRY_TO_ISO: Record<string, string> = {
  méxico: "MX",
  mexico: "MX",
  mx: "MX",
  "estados unidos": "US",
  usa: "US",
  us: "US",
};

/** Convierte el país guardado en Address (ej. "México") a ISO 3166-1 alpha-2. */
export function toStripeCountryCode(country: string) {
  const trimmed = country.trim();

  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }

  return COUNTRY_TO_ISO[trimmed.toLowerCase()] ?? "MX";
}

export function addressToStripeBillingAddress(
  address: AddressDTO,
): StripeBillingAddress {
  return {
    country: toStripeCountryCode(address.country),
    line1: address.street,
    city: address.city,
    state: address.state,
    postal_code: address.zipCode,
  };
}
