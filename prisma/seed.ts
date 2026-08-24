import { PrismaClient, ProductStatus, Role } from "@prisma/client";
import { hashPassword } from "../lib/password";

const db = new PrismaClient();

async function main() {
  const categories = [
    { name: "Nighties", slug: "nighties" },
    { name: "Night suits", slug: "night-suits" },
    { name: "Cotton edit", slug: "cotton-edit" },
  ];
  for (const category of categories) await db.category.upsert({ where: { slug: category.slug }, update: {}, create: category });
  const nightSuits = await db.category.findUniqueOrThrow({ where: { slug: "night-suits" } });
  await db.product.upsert({
    where: { slug: "rose-garden-night-suit" },
    update: {},
    create: {
      categoryId: nightSuits.id, name: "Rose Garden Night Suit", slug: "rose-garden-night-suit", sku: "SHR-001",
      description: "A relaxed two-piece set in a soft floral print, designed for unhurried evenings and easy mornings.",
      fabric: "Premium cotton blend", price: 1299, salePrice: 1299, status: ProductStatus.ACTIVE,
      variants: { create: [{ sku: "SHR-001-M-ROSE", size: "M", color: "Rose", stock: 8 }, { sku: "SHR-001-L-ROSE", size: "L", color: "Rose", stock: 10 }] },
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 12) {
    await db.user.upsert({ where: { email: adminEmail }, update: { role: Role.ADMIN, passwordHash: await hashPassword(adminPassword) }, create: { email: adminEmail, name: "SHARKI Administrator", role: Role.ADMIN, passwordHash: await hashPassword(adminPassword) } });
  } else {
    console.warn("ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters are required to seed the admin account.");
  }
}

main().finally(() => db.$disconnect());
