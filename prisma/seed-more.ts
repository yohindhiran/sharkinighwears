import { PrismaClient, ProductStatus } from "@prisma/client";

const db = new PrismaClient();

const categoriesData = [
  { name: "Nighties", slug: "nighties", desc: "Comfortable and elegant nighties for restful nights." },
  { name: "Night suits", slug: "night-suits", desc: "Matching night suits for a cozy and stylish sleepwear experience." },
  { name: "Cotton edit", slug: "cotton-edit", desc: "Pure breathable cotton sleepwear for ultimate comfort." },
  { name: "Robes & Wraps", slug: "robes-wraps", desc: "Luxurious robes and wraps to start and end your day right." },
  { name: "Sleep Shirts", slug: "sleep-shirts", desc: "Oversized and comfortable sleep shirts for lounging." }
];

const fabrics = ["Pure Cotton", "Silk Blend", "Satin", "Modal", "Viscose"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Rose", "Navy", "Ivory", "Lavender", "Teal", "Blush", "Charcoal", "Mint"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toKebabCase(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

async function main() {
  console.log("Seeding Database with sample products...");

  let seedIndex = 1;

  for (const catData of categoriesData) {
    const category = await db.category.upsert({
      where: { slug: catData.slug },
      update: { description: catData.desc },
      create: { name: catData.name, slug: catData.slug, description: catData.desc },
    });

    console.log(`Processing Category: ${catData.name}`);

    // Generate 12 products per category
    for (let i = 1; i <= 12; i++) {
      const productName = `${catData.name.replace(/s$/, "")} ${i} - ${getRandomItem(["Floral", "Solid", "Striped", "Classic", "Lace Trim", "Comfort"])}`;
      const slug = toKebabCase(`${productName}-${getRandomInt(1000, 9999)}`);
      const sku = `SHR-${catData.slug.substring(0, 3).toUpperCase()}-${getRandomInt(1000, 9999)}`;
      const price = getRandomInt(12, 45) * 100 - 1; // e.g., 1199, 1499, 4499
      const salePrice = Math.random() > 0.5 ? price - (getRandomInt(1, 5) * 100) : price;

      const product = await db.product.upsert({
        where: { slug },
        update: {},
        create: {
          categoryId: category.id,
          name: productName,
          slug,
          sku,
          description: `Experience the ultimate comfort with our ${productName}. Crafted from premium ${getRandomItem(fabrics)}, it is designed to give you a relaxed and stylish look for your evenings and easy mornings.`,
          fabric: getRandomItem(fabrics),
          price,
          salePrice,
          status: ProductStatus.ACTIVE,
        }
      });

      // Generate Variants
      const numVariants = getRandomInt(2, 4);
      const selectedColor = getRandomItem(colors);
      for (let v = 0; v < numVariants; v++) {
        const size = sizes[getRandomInt(0, sizes.length - 1)];
        const variantSku = `${sku}-${size}-${selectedColor.substring(0,3).toUpperCase()}`;
        
        await db.productVariant.upsert({
          where: { sku: variantSku },
          update: {},
          create: {
            productId: product.id,
            sku: variantSku,
            size,
            color: selectedColor,
            stock: getRandomInt(5, 30)
          }
        });
      }

      // Generate Images using pollinations API for AI generated women's nightwear
      const numImages = getRandomInt(2, 4);
      for (let img = 0; img < numImages; img++) {
        // Varying the prompt slightly per image
        const prompt = encodeURIComponent(`women wearing beautiful ${catData.name} sleepwear pajamas full body fashion photoshoot elegant cozy home interior`);
        const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=1200&nologo=true&seed=${seedIndex++}`;
        
        await db.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            alt: `${productName} Image ${img + 1}`,
            sortOrder: img
          }
        });
      }
      console.log(`Created product: ${productName}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
