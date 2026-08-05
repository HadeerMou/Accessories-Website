import { ProductStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

const categories = [
  {
    nameEn: "Accessories",
    nameAr: "اكسسوارات",
    slugEn: "accessories",
    slugAr: "accessories",
  },
  { nameEn: "Women", nameAr: "نساء", slugEn: "women", slugAr: "women" },
  { nameEn: "Men", nameAr: "رجال", slugEn: "men", slugAr: "men" },
];

for (const c of categories) {
  await prisma.category.upsert({
    where: { nameEn: c.nameEn },
    update: { ...c, updatedAt: new Date() },
    create: { ...c },
  });
}

const accessories = await prisma.category.findUnique({
  where: { nameEn: "Accessories" },
});
const women = await prisma.category.findUnique({ where: { nameEn: "Women" } });
const men = await prisma.category.findUnique({ where: { nameEn: "Men" } });

const products = [
  {
    sku: "ACC001",
    nameEn: "Leather Belt",
    nameAr: "حزام جلد",
    price: "29.99",
    stock: 50,
    status: ProductStatus.ACTIVE,
    categoryId: accessories?.id,
  },
  {
    sku: "WOM001",
    nameEn: "Silk Scarf",
    nameAr: "وشاح حريري",
    price: "19.99",
    stock: 80,
    status: ProductStatus.ACTIVE,
    categoryId: women?.id,
  },
  {
    sku: "MEN001",
    nameEn: "Classic Tie",
    nameAr: "ربطة عنق كلاسيكية",
    price: "24.99",
    stock: 60,
    status: ProductStatus.ACTIVE,
    categoryId: men?.id,
  },
];

for (const p of products) {
  await prisma.product.upsert({
    where: { sku: p.sku },
    update: { ...p, updatedAt: new Date() },
    create: { ...p },
  });
}

console.log("Products seeded");
await prisma.$disconnect();
