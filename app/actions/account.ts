"use server";

/**
 * Perfil y baja de cuenta (mockup 10, pestaña Seguridad).
 *
 * updateProfile: User.name (join), User.email, Customer.phone.
 * No pide contraseña — OAuth no tiene passwordHash.
 *
 * deleteAccount: el botón legacy de Account.jsx no tenía onClick; aquí sí.
 * Order.userId no cascada: se borran órdenes antes del User para no chocar
 * con Address (Order.shippingAddressId). El resto (Customer, CartItem,
 * Wishlist, Account, Session) sí cascada desde User.
 */

import { getLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import {
  getOrCreateCustomer,
  joinDisplayName,
} from "@/lib/account";
import { phoneDigits } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import {
  createProfileSchema,
  type AccountFormState,
} from "@/lib/validations/account";

async function profileMessages() {
  const t = await getTranslations("auth.errors");

  return {
    emailEmpty: t("emailEmpty"),
    emailMin: t("emailMin"),
    emailFormat: t("emailFormat"),
    nameEmpty: t("nameEmpty"),
    nameMin: t("nameMin"),
    lastNameEmpty: t("lastNameEmpty"),
    lastNameMin: t("lastNameMin"),
    phoneEmpty: t("phoneEmpty"),
    phoneDigits: t("phoneDigits"),
  };
}

async function requireUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function revalidateAccount() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/account`);
  revalidatePath(`/${locale}/account`, "layout");
  revalidatePath(`/${locale}`, "layout");
}

export async function updateProfile(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId();
  const t = await getTranslations("account");

  if (!userId) {
    return { error: t("unauthenticated") };
  }

  const parsed = createProfileSchema(await profileMessages()).safeParse({
    name: formData.get("name"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const emailTaken = await prisma.user.findFirst({
    where: {
      email: parsed.data.email,
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (emailTaken) {
    return { error: t("emailTaken") };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: joinDisplayName(parsed.data.name, parsed.data.lastName),
      email: parsed.data.email,
    },
  });

  await getOrCreateCustomer(userId);
  await prisma.customer.update({
    where: { userId },
    data: { phone: phoneDigits(parsed.data.phone) },
  });

  await revalidateAccount();
  return { ok: true };
}

export async function deleteAccount(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId();
  const locale = await getLocale();
  const t = await getTranslations("account");

  if (!userId) {
    return { error: t("unauthenticated") };
  }

  const expected = t("deleteConfirmWord");
  const typed = String(formData.get("confirm") ?? "").trim();

  if (typed !== expected) {
    return { error: t("deleteConfirmMismatch") };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  await signOut({ redirectTo: `/${locale}` });
  return {};
}
