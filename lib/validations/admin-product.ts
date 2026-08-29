/**
 * Validaciones admin — productos y marcas (Días 12–13).
 */

import { z } from "zod";

export type AdminFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};

export function createProductSchema(messages: {
  nameRequired: string;
  descriptionRequired: string;
  priceInvalid: string;
  stockInvalid: string;
  coverRequired: string;
  categoryRequired: string;
  brandRequired: string;
  heroRequired: string;
}) {
  return z
    .object({
      name: z.string().trim().min(1, messages.nameRequired),
      description: z.string().trim().min(1, messages.descriptionRequired),
      price: z.coerce.number().positive(messages.priceInvalid),
      stock: z.coerce.number().int().min(0, messages.stockInvalid),
      coverImageUrl: z.string().trim().min(1, messages.coverRequired),
      categoryId: z.string().trim().min(1, messages.categoryRequired),
      brandId: z.string().trim().min(1, messages.brandRequired),
      isFeatured: z.boolean(),
      heroImageUrl: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.isFeatured && !data.heroImageUrl) {
        ctx.addIssue({
          code: "custom",
          path: ["heroImageUrl"],
          message: messages.heroRequired,
        });
      }
    });
}

export function createPromotionSchema(messages: {
  titleRequired: string;
  imageRequired: string;
  productRequired: string;
  orderInvalid: string;
}) {
  return z.object({
    title: z.string().trim().min(1, messages.titleRequired),
    imageUrl: z.string().trim().min(1, messages.imageRequired),
    productId: z.string().trim().min(1, messages.productRequired),
    order: z.coerce.number().int().min(0, messages.orderInvalid),
    active: z.boolean(),
  });
}

export function createBrandSchema(messages: {
  nameRequired: string;
  logoRequired: string;
  colorInvalid: string;
}) {
  return z.object({
    name: z.string().trim().min(1, messages.nameRequired),
    logoUrl: z.string().trim().min(1, messages.logoRequired),
    bannerColor: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, messages.colorInvalid),
  });
}

export function createCategorySchema(messages: { nameRequired: string }) {
  return z.object({
    name: z.string().trim().min(1, messages.nameRequired),
  });
}
