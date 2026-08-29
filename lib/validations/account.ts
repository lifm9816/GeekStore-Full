/**
 * Perfil (mockup 10): mismos umbrales que el registro legacy / Zod de auth.
 * Nombre y apellido viven en un solo User.name; el split/join está en lib/account.ts.
 */

import { z } from "zod";
import { phoneDigits } from "@/lib/phone";

type ProfileMessages = {
  emailEmpty: string;
  emailMin: string;
  emailFormat: string;
  nameEmpty: string;
  nameMin: string;
  lastNameEmpty: string;
  lastNameMin: string;
  phoneEmpty: string;
  phoneDigits: string;
};

export function createProfileSchema(messages: ProfileMessages) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.nameEmpty)
      .min(3, messages.nameMin),
    lastName: z
      .string()
      .trim()
      .min(1, messages.lastNameEmpty)
      .min(3, messages.lastNameMin),
    email: z
      .string()
      .trim()
      .min(1, messages.emailEmpty)
      .min(8, messages.emailMin)
      .refine((value) => value.includes("@") && value.includes("."), {
        message: messages.emailFormat,
      }),
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneEmpty)
      .refine((value) => phoneDigits(value).length === 10, {
        message: messages.phoneDigits,
      }),
  });
}

export type AccountFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};
