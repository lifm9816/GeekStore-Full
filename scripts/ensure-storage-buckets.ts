/**
 * Crea buckets públicos brand-logos y product-images en Supabase Storage.
 * Preferible con SUPABASE_SERVICE_ROLE_KEY; con solo ANON suele fallar por permisos.
 *
 * Uso: npx tsx scripts/ensure-storage-buckets.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local", override: true });

const BUCKETS = ["brand-logos", "product-images"] as const;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL y una API key de Supabase.");
  }

  const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log(
    usingServiceRole
      ? "Usando SERVICE_ROLE_KEY…"
      : "Usando ANON_KEY (puede fallar al crear buckets)…",
  );

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const id of BUCKETS) {
    const existing = await supabase.storage.getBucket(id);

    if (existing.data) {
      console.log(`✓ Bucket ya existe: ${id}`);
      continue;
    }

    const { data, error } = await supabase.storage.createBucket(id, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ],
    });

    if (error) {
      console.error(`✗ No se pudo crear ${id}:`, error.message);
      console.error(
        "  → Crea el bucket en Supabase Dashboard → Storage → New bucket (Public),",
      );
      console.error(
        "    o agrega SUPABASE_SERVICE_ROLE_KEY en .env.local y vuelve a correr este script.",
      );
    } else {
      console.log(`✓ Bucket creado: ${id}`, data);
    }
  }

  const list = await supabase.storage.listBuckets();
  console.log(
    "Buckets actuales:",
    list.data?.map((b) => b.name).join(", ") || list.error?.message,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
