/**
 * Crea buckets vía SQL en storage.buckets (mismo Postgres de Supabase).
 * Uso: npx tsx scripts/ensure-storage-buckets-sql.ts
 */

import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

config({ path: ".env.local", override: true });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta DIRECT_URL o DATABASE_URL.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

async function main() {
  await prisma.$executeRawUnsafe(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES
      (
        'brand-logos',
        'brand-logos',
        true,
        5242880,
        ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
      ),
      (
        'product-images',
        'product-images',
        true,
        5242880,
        ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
      )
    ON CONFLICT (id) DO UPDATE
    SET public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types
  `);

  // Lectura pública de objetos (necesario para getPublicUrl / <img>).
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'geekstore_public_read_brand_logos'
      ) THEN
        CREATE POLICY geekstore_public_read_brand_logos
          ON storage.objects FOR SELECT
          USING (bucket_id = 'brand-logos');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'geekstore_public_read_product_images'
      ) THEN
        CREATE POLICY geekstore_public_read_product_images
          ON storage.objects FOR SELECT
          USING (bucket_id = 'product-images');
      END IF;

      -- Inserts desde la app (anon key) mientras no haya SERVICE_ROLE.
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'geekstore_public_insert_brand_logos'
      ) THEN
        CREATE POLICY geekstore_public_insert_brand_logos
          ON storage.objects FOR INSERT
          WITH CHECK (bucket_id = 'brand-logos');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'geekstore_public_insert_product_images'
      ) THEN
        CREATE POLICY geekstore_public_insert_product_images
          ON storage.objects FOR INSERT
          WITH CHECK (bucket_id = 'product-images');
      END IF;
    END $$;
  `);

  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: string; public: boolean }>
  >(`SELECT id, public FROM storage.buckets WHERE id IN ('brand-logos','product-images')`);

  console.log("Buckets listos:", rows);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
