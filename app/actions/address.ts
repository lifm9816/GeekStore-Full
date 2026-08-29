"use server";

/**
 * Libreta de direcciones (mockup 05). Dependencia del checkout (Días 9–10):
 * Address.isDefault es la que se preselecciona al pagar.
 *
 * Invariante: si el cliente tiene al menos una dirección, exactamente una
 * tiene isDefault=true. La primera se fuerza predeterminada; marcar otra
 * desmarca el resto en la misma transacción.
 */

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getOrCreateCustomer } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import {
  createAddressSchema,
  type AddressFormState,
} from "@/lib/validations/address";

async function addressMessages() {
  const t = await getTranslations("account.addressErrors");

  return {
    labelRequired: t("labelRequired"),
    streetRequired: t("streetRequired"),
    cityRequired: t("cityRequired"),
    stateRequired: t("stateRequired"),
    zipRequired: t("zipRequired"),
    countryRequired: t("countryRequired"),
  };
}

async function revalidateAddresses() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/account/addresses`);
  revalidatePath(`/${locale}/account`);
}

async function requireCustomer() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const customer = await getOrCreateCustomer(userId);
  return { userId, customer };
}

async function setOnlyDefault(customerId: string, addressId: string) {
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { customerId },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);
}

async function ensureOneDefault(customerId: string) {
  const current = await prisma.address.findFirst({
    where: { customerId, isDefault: true },
    select: { id: true },
  });

  if (current) {
    return;
  }

  const fallback = await prisma.address.findFirst({
    where: { customerId },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  if (fallback) {
    await prisma.address.update({
      where: { id: fallback.id },
      data: { isDefault: true },
    });
  }
}

export async function createAddress(
  _prev: AddressFormState | undefined,
  formData: FormData,
): Promise<AddressFormState> {
  const ctx = await requireCustomer();
  const t = await getTranslations("account");

  if (!ctx) {
    return { error: t("unauthenticated") };
  }

  const parsed = createAddressSchema(await addressMessages()).safeParse({
    label: formData.get("label"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const count = await prisma.address.count({
    where: { customerId: ctx.customer.id },
  });
  const wantsDefault = formData.get("isDefault") === "on" || count === 0;

  const created = await prisma.address.create({
    data: {
      customerId: ctx.customer.id,
      ...parsed.data,
      isDefault: false,
    },
  });

  if (wantsDefault) {
    await setOnlyDefault(ctx.customer.id, created.id);
  } else {
    await ensureOneDefault(ctx.customer.id);
  }

  await revalidateAddresses();
  return { ok: true };
}

export async function updateAddress(
  _prev: AddressFormState | undefined,
  formData: FormData,
): Promise<AddressFormState> {
  const ctx = await requireCustomer();
  const t = await getTranslations("account");
  const id = String(formData.get("id") ?? "");

  if (!ctx) {
    return { error: t("unauthenticated") };
  }

  const parsed = createAddressSchema(await addressMessages()).safeParse({
    label: formData.get("label"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.address.findFirst({
    where: { id, customerId: ctx.customer.id },
  });

  if (!existing) {
    return { error: t("addressNotFound") };
  }

  const wantsDefault = formData.get("isDefault") === "on";

  await prisma.address.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  if (wantsDefault) {
    await setOnlyDefault(ctx.customer.id, existing.id);
  } else if (existing.isDefault) {
    await prisma.address.update({
      where: { id: existing.id },
      data: { isDefault: false },
    });
    await ensureOneDefault(ctx.customer.id);
  }

  await revalidateAddresses();
  return { ok: true };
}

export async function deleteAddress(addressId: string) {
  const ctx = await requireCustomer();

  if (!ctx) {
    return { ok: false as const };
  }

  const existing = await prisma.address.findFirst({
    where: { id: addressId, customerId: ctx.customer.id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false as const };
  }

  await prisma.address.delete({ where: { id: existing.id } });
  await ensureOneDefault(ctx.customer.id);
  await revalidateAddresses();
  return { ok: true as const };
}

export async function setDefaultAddress(addressId: string) {
  const ctx = await requireCustomer();

  if (!ctx) {
    return { ok: false as const };
  }

  const existing = await prisma.address.findFirst({
    where: { id: addressId, customerId: ctx.customer.id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false as const };
  }

  await setOnlyDefault(ctx.customer.id, existing.id);
  await revalidateAddresses();
  return { ok: true as const };
}
