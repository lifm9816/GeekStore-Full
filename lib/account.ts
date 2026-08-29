/**
 * Lectura de cuenta (Día 8 / mockup 10).
 *
 * User.name es un string único (el registro concatena nombre + apellido).
 * El formulario de perfil los muestra por separado: split por el último
 * espacio al leer, join al guardar. No hay campos firstName/lastName en Prisma.
 *
 * getOrCreateCustomer cubre OAuth (events.createUser) y cuentas viejas sin fila.
 */

import { prisma } from "@/lib/prisma";

export type AddressDTO = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

export function splitDisplayName(fullName: string | null | undefined) {
  const trimmed = fullName?.trim() ?? "";

  if (!trimmed) {
    return { name: "", lastName: "" };
  }

  const lastSpace = trimmed.lastIndexOf(" ");

  if (lastSpace === -1) {
    return { name: trimmed, lastName: "" };
  }

  return {
    name: trimmed.slice(0, lastSpace).trim(),
    lastName: trimmed.slice(lastSpace + 1).trim(),
  };
}

export function joinDisplayName(name: string, lastName: string) {
  return `${name.trim()} ${lastName.trim()}`.trim();
}

export function getInitials(fullName: string | null | undefined) {
  const { name, lastName } = splitDisplayName(fullName);
  const first = name.charAt(0);
  const last = lastName.charAt(0) || name.charAt(1);

  return `${first}${last}`.toUpperCase() || "?";
}

export async function getOrCreateCustomer(userId: string) {
  return prisma.customer.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getAccountUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      customer: {
        select: {
          phone: true,
          loyaltyPoints: true,
          _count: { select: { addresses: true } },
        },
      },
      _count: {
        select: { orders: true, wishlists: true },
      },
    },
  });
}

export async function getAddresses(userId: string): Promise<AddressDTO[]> {
  const customer = await getOrCreateCustomer(userId);

  return prisma.address.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
    select: {
      id: true,
      label: true,
      street: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      isDefault: true,
    },
  });
}

export async function getOrdersForAccount(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: {
        take: 3,
        include: {
          product: {
            select: {
              name: true,
              coverImageUrl: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}
