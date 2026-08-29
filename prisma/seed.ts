import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

config();
config({ path: ".env.local", override: true });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta DIRECT_URL o DATABASE_URL para ejecutar el seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  const [consolas, videojuegos, perifericos] = await Promise.all([
    prisma.category.create({
      data: { name: "Consolas", slug: "consolas" },
    }),
    prisma.category.create({
      data: { name: "Videojuegos", slug: "videojuegos" },
    }),
    prisma.category.create({
      data: { name: "Periféricos", slug: "perifericos" },
    }),
  ]);

  const [accion, aventura, rpg, survival] = await Promise.all([
    prisma.genre.create({ data: { name: "Acción", slug: "accion" } }),
    prisma.genre.create({ data: { name: "Aventura", slug: "aventura" } }),
    prisma.genre.create({ data: { name: "RPG", slug: "rpg" } }),
    prisma.genre.create({ data: { name: "Survival horror", slug: "survival-horror" } }),
  ]);

  const [playstation, xbox, nintendo] = await Promise.all([
    prisma.brand.create({
      data: {
        name: "PlayStation",
        slug: "playstation",
        logoUrl: "/images/brands/fondo_ps.png",
        bannerColor: "#003791",
      },
    }),
    prisma.brand.create({
      data: {
        name: "Xbox",
        slug: "xbox",
        logoUrl: "/images/brands/fondo_x.png",
        bannerColor: "#107C10",
      },
    }),
    prisma.brand.create({
      data: {
        name: "Nintendo",
        slug: "nintendo",
        logoUrl: "/images/brands/fondo_nintendo.png",
        bannerColor: "#E60012",
      },
    }),
  ]);

  const spiderMan = await prisma.product.create({
    data: {
      name: "Spider-Man 2",
      description:
        "Continúa la historia de Peter Parker y Miles Morales en esta secuela exclusiva de PS5. Incluye modo fotografía y nuevas habilidades simbióticas.",
      price: 1400,
      stock: 15,
      coverImageUrl: "/images/products/spiderman2_fisico.jpg",
      categoryId: videojuegos.id,
      brandId: playstation.id,
      isFeatured: true,
      heroImageUrl: "/images/products/spiderman2.jpg",
      genres: { connect: [{ id: accion.id }, { id: aventura.id }] },
      images: {
        create: [{ url: "/images/products/spiderman2.jpg", order: 1 }],
      },
    },
  });

  const gears = await prisma.product.create({
    data: {
      name: "Gears of War 4",
      description:
        "Juego para Xbox One/Series X. La saga de Marcus Fenix regresa en esta edición física compatible con la familia Xbox.",
      price: 700,
      stock: 15,
      coverImageUrl: "/images/products/gow4_fisico.jpg",
      categoryId: videojuegos.id,
      brandId: xbox.id,
      genres: { connect: [{ id: accion.id }] },
      images: {
        create: [{ url: "/images/products/gow.jpeg", order: 1 }],
      },
    },
  });

  const mario = await prisma.product.create({
    data: {
      name: "Super Mario Bros. Wonder",
      description:
        "Juego para Nintendo Switch. Una nueva aventura 2D de Mario con power-ups y mundos sorprendentes.",
      price: 1050,
      stock: 15,
      coverImageUrl: "/images/products/mariowonder_fisico.jpg",
      categoryId: videojuegos.id,
      brandId: nintendo.id,
      genres: { connect: [{ id: aventura.id }] },
      images: {
        create: [{ url: "/images/products/mario.jpeg", order: 1 }],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Marvel's Spider-Man: Miles Morales",
      description:
        "Miles Morales protagoniza su propia historia en Nueva York. Edición física para PlayStation.",
      price: 999,
      stock: 12,
      coverImageUrl: "/images/products/portada_miles.jpeg",
      categoryId: videojuegos.id,
      brandId: playstation.id,
      genres: { connect: [{ id: accion.id }, { id: aventura.id }] },
    },
  });

  await prisma.product.create({
    data: {
      name: "God of War Ragnarök",
      description:
        "Kratos y Atreus enfrentan el Ragnarök en los Nueve Reinos. Edición física para PlayStation 5.",
      price: 1400,
      stock: 10,
      coverImageUrl: "/images/products/gowragnarok_fisico.jpg",
      categoryId: videojuegos.id,
      brandId: playstation.id,
      genres: { connect: [{ id: accion.id }, { id: aventura.id }, { id: rpg.id }] },
    },
  });

  await prisma.product.create({
    data: {
      name: "Alan Wake 2",
      description:
        "Survival horror cinematográfico de Remedy. Edición física para Xbox Series X/S.",
      price: 1199,
      stock: 8,
      coverImageUrl: "/images/products/aw2_fisico.jpg",
      categoryId: videojuegos.id,
      brandId: xbox.id,
      genres: { connect: [{ id: survival.id }, { id: aventura.id }] },
      images: {
        create: [{ url: "/images/products/aw2.jpg", order: 1 }],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Control inalámbrico Xbox",
      description:
        "Control inalámbrico Xbox con agarre texturizado y palancas híbridas. Compatible con Xbox Series X/S, Xbox One y PC.",
      price: 1299,
      stock: 20,
      coverImageUrl: "/images/products/control-xbox.svg",
      categoryId: perifericos.id,
      brandId: xbox.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Nintendo Switch OLED",
      description:
        "Consola Nintendo Switch modelo OLED, con pantalla de 7 pulgadas y base con puerto LAN.",
      price: 7499,
      stock: 6,
      coverImageUrl: "/images/products/nintendo-switch-oled.svg",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
  });

  console.log("Seed listo:", {
    categories: 3,
    brands: 3,
    genres: 4,
    products: 8,
    promotions: 3,
    originals: [spiderMan.name, gears.name, mario.name],
    featured: [spiderMan.name],
  });

  await prisma.promotion.createMany({
    data: [
      {
        title: "Spider-Man 2",
        imageUrl: "/images/products/spiderman2.jpg",
        productId: spiderMan.id,
        order: 0,
        active: true,
      },
      {
        title: "Super Mario Bros. Wonder",
        imageUrl: "/images/products/mario.jpeg",
        productId: mario.id,
        order: 1,
        active: true,
      },
      {
        title: "Gears of War 4",
        imageUrl: "/images/products/gow.jpeg",
        productId: gears.id,
        order: 2,
        active: true,
      },
    ],
  });

  const passwordHash = await hash("123456789", 10);
  const users = [
    {
      email: "lifm1698@outlook.com",
      name: "Luis Martínez",
      role: "CUSTOMER" as const,
    },
    {
      email: "lifm98@outlook.com",
      name: "Amy Martínez",
      role: "ADMIN" as const,
    },
  ];

  for (const seedUser of users) {
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        name: seedUser.name,
        passwordHash,
        role: seedUser.role,
      },
      create: {
        name: seedUser.name,
        email: seedUser.email,
        passwordHash,
        role: seedUser.role,
        emailVerified: new Date(),
        customer: {
          create: { phone: "2225265031" },
        },
      },
      include: { customer: true },
    });

    if (!user.customer) {
      await prisma.customer.create({
        data: { userId: user.id, phone: "2225265031" },
      });
    }
  }

  console.log("Usuarios semilla:", users.map((user) => user.email));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
