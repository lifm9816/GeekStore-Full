import { z } from "zod";

type LoginMessages = {
  emailEmpty: string;
  emailMin: string;
  emailFormat: string;
  passwordEmpty: string;
  passwordMin: string;
};

type RegisterMessages = LoginMessages & {
  nameEmpty: string;
  nameMin: string;
  lastNameEmpty: string;
  lastNameMin: string;
  phoneEmpty: string;
  phoneDigits: string;
  confirmEmpty: string;
  confirmMismatch: string;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function createLoginSchema(messages: LoginMessages) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, messages.emailEmpty)
      .min(8, messages.emailMin)
      .refine((value) => value.includes("@") && value.includes("."), {
        message: messages.emailFormat,
      }),
    password: z
      .string()
      .min(1, messages.passwordEmpty)
      .min(9, messages.passwordMin),
  });
}

export function createRegisterSchema(messages: RegisterMessages) {
  return createLoginSchema(messages)
    .extend({
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
      phone: z
        .string()
        .trim()
        .min(1, messages.phoneEmpty)
        .refine((value) => digitsOnly(value).length === 10, {
          message: messages.phoneDigits,
        }),
      confirmPassword: z.string().min(1, messages.confirmEmpty),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.confirmMismatch,
      path: ["confirmPassword"],
    });
}

export function phoneDigits(value: string) {
  return digitsOnly(value);
}

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
