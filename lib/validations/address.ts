/**
 * Libreta de direcciones (mockup 05). Todos los campos del formulario son
 * requeridos; isDefault se resuelve en la Server Action (una sola predeterminada).
 */

import { z } from "zod";

type AddressMessages = {
  labelRequired: string;
  streetRequired: string;
  cityRequired: string;
  stateRequired: string;
  zipRequired: string;
  countryRequired: string;
};

export function createAddressSchema(messages: AddressMessages) {
  return z.object({
    label: z.string().trim().min(1, messages.labelRequired),
    street: z.string().trim().min(1, messages.streetRequired),
    city: z.string().trim().min(1, messages.cityRequired),
    state: z.string().trim().min(1, messages.stateRequired),
    zipCode: z.string().trim().min(1, messages.zipRequired),
    country: z.string().trim().min(1, messages.countryRequired),
  });
}

export type AddressFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};
