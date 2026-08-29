"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";
import { signIn, signOut } from "@/auth";
import { safeRedirectPath } from "@/lib/auth-redirect";
import { prisma } from "@/lib/prisma";
import {
  createLoginSchema,
  createRegisterSchema,
  phoneDigits,
  type AuthFormState,
} from "@/lib/validations/auth";

async function validationMessages() {
  const t = await getTranslations("auth.errors");

  return {
    emailEmpty: t("emailEmpty"),
    emailMin: t("emailMin"),
    emailFormat: t("emailFormat"),
    passwordEmpty: t("passwordEmpty"),
    passwordMin: t("passwordMin"),
    nameEmpty: t("nameEmpty"),
    nameMin: t("nameMin"),
    lastNameEmpty: t("lastNameEmpty"),
    lastNameMin: t("lastNameMin"),
    phoneEmpty: t("phoneEmpty"),
    phoneDigits: t("phoneDigits"),
    confirmEmpty: t("confirmEmpty"),
    confirmMismatch: t("confirmMismatch"),
  };
}

export async function loginWithCredentials(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = await getLocale();
  const t = await getTranslations("auth.errors");
  const parsed = createLoginSchema(await validationMessages()).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirectPath(formData.get("callbackUrl"), locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t("invalidCredentials") };
    }

    throw error;
  }

  return {};
}

export async function registerWithCredentials(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = await getLocale();
  const t = await getTranslations("auth.errors");
  const parsed = createRegisterSchema(await validationMessages()).safeParse({
    name: formData.get("name"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return { error: t("emailTaken") };
  }

  const passwordHash = await hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: `${parsed.data.name} ${parsed.data.lastName}`,
      email: parsed.data.email,
      passwordHash,
      role: "CUSTOMER",
      customer: {
        create: { phone: phoneDigits(parsed.data.phone) },
      },
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirectPath(formData.get("callbackUrl"), locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t("generic") };
    }

    throw error;
  }

  return {};
}

export async function signInWithGoogle(formData: FormData) {
  const locale = await getLocale();

  await signIn("google", {
    redirectTo: safeRedirectPath(formData.get("callbackUrl"), locale),
  });
}

export async function signOutAction() {
  const locale = await getLocale();
  await signOut({ redirectTo: `/${locale}` });
}
