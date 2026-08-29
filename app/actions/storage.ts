"use server";

/**
 * Upload a Supabase Storage (Días 12–13). Solo ADMIN.
 * Buckets: brand-logos | product-images.
 */

import { auth } from "@/auth";
import {
  STORAGE_BUCKETS,
  uploadPublicImage,
  type StorageBucket,
} from "@/lib/supabase-storage";

export type UploadImageState = {
  error?: string;
  publicUrl?: string;
};

function resolveBucket(kind: string): StorageBucket | null {
  if (kind === "brand") {
    return STORAGE_BUCKETS.brandLogos;
  }

  if (kind === "product") {
    return STORAGE_BUCKETS.productImages;
  }

  return null;
}

export async function uploadAdminImage(
  formData: FormData,
): Promise<UploadImageState> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "No autorizado." };
  }

  const kind = String(formData.get("kind") ?? "");
  const bucket = resolveBucket(kind);
  const file = formData.get("file");

  if (!bucket) {
    return { error: "Tipo de imagen inválido." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo de imagen." };
  }

  const result = await uploadPublicImage(bucket, file, kind);

  if (!result.ok) {
    return { error: result.error };
  }

  return { publicUrl: result.publicUrl };
}
