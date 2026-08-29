/**
 * Cliente Supabase SOLO para Storage (Días 12–13).
 * Datos de negocio siguen exclusivamente vía Prisma — no uses este client
 * para tablas Postgres.
 *
 * Buckets públicos esperados (crear en Dashboard de Supabase):
 * - brand-logos
 * - product-images
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKETS = {
  brandLogos: "brand-logos",
  productImages: "product-images",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

let storageClient: SupabaseClient | null = null;

function getSupabaseStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o ANON_KEY).",
    );
  }

  if (!storageClient) {
    storageClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return storageClient;
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

export type UploadPublicImageResult =
  | { ok: true; publicUrl: string; path: string }
  | { ok: false; error: string };

/**
 * Sube un archivo a un bucket público y devuelve la URL pública.
 * path = `{folder}/{cuid}.{ext}` para evitar colisiones.
 *
 * Si el bucket no existe, intenta crearlo (requiere SERVICE_ROLE;
 * con ANON suele fallar — usar scripts/ensure-storage-buckets-sql.ts).
 */
export async function uploadPublicImage(
  bucket: StorageBucket,
  file: File,
  folder = "uploads",
): Promise<UploadPublicImageResult> {
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      error: "Formato no permitido. Usa JPG, PNG, WebP, GIF o SVG.",
    };
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { ok: false, error: "La imagen debe pesar entre 1 byte y 5 MB." };
  }

  const ext = extensionForMime(file.type);
  const id = crypto.randomUUID();
  const path = `${folder}/${id}.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const client = getSupabaseStorageClient();

  let { error } = await client.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error?.message?.toLowerCase().includes("bucket not found")) {
    await client.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: MAX_BYTES,
    });
    ({ error } = await client.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    }));
  }

  if (error) {
    console.error("[supabase-storage] upload falló:", error.message);
    const friendly = error.message.toLowerCase().includes("bucket")
      ? `${error.message}. Crea los buckets públicos brand-logos y product-images en Supabase Storage, o corre: npx tsx scripts/ensure-storage-buckets-sql.ts`
      : error.message;
    return { ok: false, error: friendly };
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);

  return { ok: true, publicUrl: data.publicUrl, path };
}
