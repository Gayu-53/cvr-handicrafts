import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---- Real catalogue extracted from the client's PDFs ----
// Category mapping (as instructed): Statues = deities/idols, Buddha = Buddha Collection PDF,
// Tanjore = dancing dolls / Thanjavur pieces. Everything else grouped under sensible
// new categories (Diyas & Lamps, Décor) so nothing is lost, without inventing products.

type SeedSpec = { label: string; value: string };
type SeedProduct = {
  name: string;
  code?: string;
  price: number;
  category: "Statues" | "Buddha" | "Tanjore" | "Diyas & Lamps" | "Décor";
  specs: SeedSpec[];
  description?: string;
};

const products: SeedProduct[] = [
  // ---- Statues (deities/idols) ----
  { name: "Guberar", code: "DV10A", price: 525, category: "Statues", specs: [{ label: "Height", value: "1.5 inch" }, { label: "Weight", value: "26gm" }, { label: "Material", value: "German Silver" }] },
  { name: "Lakshmi", code: "DV104", price: 525, category: "Statues", specs: [{ label: "Height", value: "1.5 inch" }, { label: "Weight", value: "26gm" }, { label: "Material", value: "German Silver" }] },
  { name: "Saraswati", code: "DV102", price: 500, category: "Statues", specs: [{ label: "Height", value: "1.5 inch" }, { label: "Weight", value: "38gm" }, { label: "Material", value: "German Silver" }] },
  { name: "Murugar", code: "FRS12", price: 220, category: "Statues", specs: [{ label: "Height", value: "2 inch" }, { label: "Weight", value: "25gm" }, { label: "Material", value: "Brass" }] },
  { name: "Lingam", code: "FRS12", price: 220, category: "Statues", specs: [{ label: "Height", value: "1.25 inch" }, { label: "Weight", value: "57gm" }, { label: "Material", value: "Brass" }] },
  { name: "Duck", code: "FRS12", price: 220, category: "Statues", specs: [{ label: "Height", value: "1 inch" }, { label: "Weight", value: "15gm" }, { label: "Material", value: "Brass" }] },
  { name: "Horse", code: "JRS12", price: 220, category: "Statues", specs: [{ label: "Height", value: "1.25 inch" }, { label: "Weight", value: "12gm" }, { label: "Material", value: "Brass" }] },
  { name: "Ganesh Statue", code: "DV10B", price: 1250, category: "Statues", specs: [{ label: "Height", value: "2 inch" }, { label: "Weight", value: "79gm" }, { label: "Material", value: "German Silver" }] },
  { name: "Tirupathi Balaji", code: "DV19", price: 1080, category: "Statues", specs: [{ label: "Height", value: "3.5 inch" }, { label: "Weight", value: "31gm" }, { label: "Material", value: "German Silver" }] },
  { name: "Varahi Amman", code: "PRJ30", price: 780, category: "Statues", specs: [{ label: "Height", value: "2.9 inch" }, { label: "Weight", value: "194gm" }, { label: "Material", value: "Brass" }] },
  { name: "Varahi Amman (Large)", code: "PRJ31", price: 1050, category: "Statues", specs: [{ label: "Height", value: "3.5 inch" }, { label: "Weight", value: "288gm" }, { label: "Material", value: "Brass" }] },
  { name: "Vinayagar", code: "1SF54142", price: 450, category: "Statues", specs: [{ label: "Height", value: "2.8 inch" }, { label: "Weight", value: "36gm" }, { label: "Material", value: "Fine art Brass" }] },
  { name: "Murugar Statue", code: "", price: 1040, category: "Statues", specs: [{ label: "Height", value: "3 inch" }, { label: "Weight", value: "79gm" }, { label: "Material", value: "Fine art Brass" }] },
  { name: "Baby Krishna Statue", code: "4SF5695", price: 1790, category: "Statues", specs: [{ label: "Height", value: "3 inch" }, { label: "Weight", value: "140gm" }, { label: "Material", value: "Fine art Brass" }] },
  { name: "Murugar Statue (Radha Krishna Style)", code: "JRAJ04", price: 400, category: "Statues", specs: [{ label: "Height", value: "2.5 inch" }, { label: "Weight", value: "83gm" }, { label: "Material", value: "Brass" }] },
  { name: "Radhakrishnan Statue Set", code: "KHDRK1", price: 3780, category: "Statues", specs: [{ label: "Height", value: "6 inch, 5.5 inch" }, { label: "Weight", value: "360 gm" }, { label: "Material", value: "Fine art Brass" }] },
  { name: "Natarajar Statue", code: "JMC09", price: 1200, category: "Statues", specs: [{ label: "Height", value: "4 inch" }, { label: "Weight", value: "170gm" }, { label: "Material", value: "Brass" }] },
  { name: "Guber Idol", code: "GA6055", price: 1190, category: "Statues", specs: [{ label: "Height", value: "3 inch" }, { label: "Weight", value: "464gm" }, { label: "Material", value: "Brass" }] },
  { name: "Murugar (Panchamukhi Style)", code: "", price: 1040, category: "Statues", specs: [{ label: "Height", value: "3 inch" }, { label: "Weight", value: "82gm" }, { label: "Material", value: "Fine art Brass" }] },
  { name: "Panchamukhi Ganesh", code: "GM124076", price: 1450, category: "Statues", specs: [{ label: "Height", value: "3.5 inch" }, { label: "Weight", value: "464gm" }, { label: "Material", value: "Brass" }] },

  // ---- Buddha collection ----
  { name: "White Buddha", code: "MST87", price: 2300, category: "Buddha", specs: [{ label: "Height", value: "16 inch" }], description: "A serene white seated Buddha with a raised hand, detailed robe and peaceful meditative expression." },
  { name: "White Buddha (Ornate Base)", code: "MST88", price: 3600, category: "Buddha", specs: [{ label: "Height", value: "17.5 inch" }], description: "An elegant white seated Buddha with an ornate base, calm expression and finely sculpted details." },
  { name: "Blue Buddha", code: "JRN 60", price: 590, category: "Buddha", specs: [{ label: "Height", value: "6.5 inch" }], description: "A distinctive blue Buddha head with golden textured hair and a tranquil expression." },
  { name: "White Buddha Head", code: "", price: 1350, category: "Buddha", specs: [{ label: "Height", value: "12 inch" }], description: "A white Buddha head with a metallic silver-toned crown and a calm, closed-eye expression." },
  { name: "Radium Buddha", code: "", price: 1800, category: "Buddha", specs: [{ label: "Height", value: "16 inch" }], description: "A luminous-toned Buddha head with a silver crown and a peaceful expression." },
  { name: "Yellow Buddha", code: "MST33", price: 1150, category: "Buddha", specs: [{ label: "Height", value: "10 inch" }], description: "A seated Buddha in warm yellow and maroon tones, finished with ornate decorative detailing." },
  { name: "Blue Robed Buddha", code: "FPG36", price: 3000, category: "Buddha", specs: [{ label: "Height", value: "14 inch" }], description: "A bright blue-robed seated Buddha with gold detailing and a traditional meditative posture." },
  { name: "Baby Buddha", code: "MST61", price: 900, category: "Buddha", specs: [{ label: "Height", value: "8 inch" }], description: "A small golden Buddha in a pink robe, seated peacefully with detailed decorative embellishments." },
  { name: "Laughing Buddha", code: "MST61", price: 900, category: "Buddha", specs: [{ label: "Height", value: "8 inch" }], description: "A cheerful golden-yellow baby-style Buddha with hands joined in prayer and a smiling expression." },
  { name: "Wine Buddha", code: "MST87", price: 2300, category: "Buddha", specs: [{ label: "Height", value: "16 inch" }], description: "A richly finished wine-coloured seated Buddha with intricate robe patterns and a serene expression." },
  { name: "White & Purple Buddha", code: "OC56", price: 390, category: "Buddha", specs: [{ label: "Height", value: "6.5 inch" }], description: "A compact white-and-purple seated Buddha with gold accents and an ornate decorative base." },
  { name: "Buddha with Raised Hand", code: "NVB14", price: 800, category: "Buddha", specs: [{ label: "Height", value: "8 inch" }], description: "A white Buddha sculpture with a raised hand and a distinctive weathered, textured lower form." },
  { name: "Buddha on Lotus Base", code: "NVB14", price: 800, category: "Buddha", specs: [{ label: "Height", value: "8 inch" }], description: "A white seated Buddha with detailed robes and a lotus-inspired base." },
  { name: "Buddha Water Fountain", code: "MTG04", price: 1850, category: "Buddha", specs: [{ label: "Height", value: "11 inch" }], description: "A gold-and-black Buddha fountain design featuring a decorative water-bowl element and ornate base." },
  { name: "Black Hand Buddha", code: "MST34", price: 620, category: "Buddha", specs: [{ label: "Height", value: "8 inch" }], description: "A compact black Buddha seated within a sculpted dark enclosure, highlighted with gold detailing." },
  { name: "Small Buddha", code: "FPG 27", price: 80, category: "Buddha", specs: [{ label: "Height", value: "2 inch" }], description: "A small bronze-toned Buddha figurine with a compact seated form and antique-style finish." },
  { name: "Spring Buddha", code: "", price: 450, category: "Buddha", specs: [{ label: "Height", value: "4 inch" }], description: "A cheerful blue-and-gold Buddha figurine holding a decorative object, designed as a bright décor piece." },
  { name: "Black Buddha", code: "MST33", price: 1180, category: "Buddha", specs: [{ label: "Height", value: "10 inch" }], description: "A blue-and-gold seated Buddha with an ornate throne-style base and detailed decorative finish." },
  { name: "Red Robed Buddha", code: "FPG36", price: 3000, category: "Buddha", specs: [{ label: "Height", value: "14.5 inch" }, { label: "Material", value: "Resin" }], description: "A glossy white Buddha in a red robe with gold edging, seated in meditation with an elegant detailed finish." },

  // ---- Tanjore / Thanjavur art ----
  { name: "Poikalkuthirai Thanjavur Doll", code: "MBBH11", price: 3520, category: "Tanjore", specs: [{ label: "Height", value: "14 inch" }, { label: "Material", value: "Clay" }] },
  { name: "Thanjavur Dancing Doll Set", code: "MBBH07", price: 990, category: "Tanjore", specs: [{ label: "Height", value: "9 inch" }, { label: "Material", value: "Clay" }] },
  { name: "Thatha Patti Doll", code: "MBBH09", price: 990, category: "Tanjore", specs: [{ label: "Height", value: "7 inch" }, { label: "Material", value: "Clay" }] },
  { name: "Thanjavur Dancing Doll Set (Krishna)", code: "MBBH02", price: 1650, category: "Tanjore", specs: [{ label: "Height", value: "13 inch" }, { label: "Material", value: "Clay" }] },
  { name: "Kathakali Doll", code: "MBBH10", price: 1760, category: "Tanjore", specs: [{ label: "Height", value: "15.5 inch" }, { label: "Material", value: "Clay" }] },
  { name: "Thanjavur Dancing Doll", code: "MBBH08", price: 500, category: "Tanjore", specs: [{ label: "Height", value: "9 inch" }, { label: "Material", value: "Clay" }] },

  // ---- Diyas & Lamps ----
  { name: "Krishna Statue Lamp", code: "ALA03", price: 2600, category: "Diyas & Lamps", specs: [{ label: "Height", value: "15 inch" }, { label: "Material", value: "Poly Resin" }] },
  { name: "Small Diya", code: "PRJ02", price: 360, category: "Diyas & Lamps", specs: [{ label: "Height", value: "5.5 inch" }, { label: "Material", value: "Brass" }] },
  { name: "Gopuram Vilakku", code: "PRJ27", price: 230, category: "Diyas & Lamps", specs: [{ label: "Height", value: "4 inch" }, { label: "Material", value: "Brass" }] },
  { name: "Kerala Nilavilakku", code: "PRJ05", price: 880, category: "Diyas & Lamps", specs: [{ label: "Height", value: "7.5 inch" }, { label: "Material", value: "Brass" }] },
  { name: "Adukku Kuthu Vilakku", code: "PRJ06", price: 1880, category: "Diyas & Lamps", specs: [{ label: "Height", value: "10 inch" }, { label: "Material", value: "Brass" }] },
  { name: "Annapatchi Kuthu Vilakku", code: "PRJ12", price: 2100, category: "Diyas & Lamps", specs: [{ label: "Height", value: "12 inch" }, { label: "Material", value: "Brass" }] },
  { name: "Arumuga Vilakku", code: "PRJ08", price: 1300, category: "Diyas & Lamps", specs: [{ label: "Height", value: "7 inch" }, { label: "Material", value: "Brass" }] },

  // ---- Décor (rangoli boards etc.) ----
  { name: "Square Manai", code: "ASW05", price: 270, category: "Décor", specs: [{ label: "Height", value: "1.5 inch" }, { label: "Dia", value: "6 inch" }, { label: "Material", value: "MDF Wood" }] },
  { name: "Round Manai", code: "ASW06", price: 270, category: "Décor", specs: [{ label: "Height", value: "1.5 inch" }, { label: "Dia", value: "6 inch" }, { label: "Material", value: "MDF Wood" }] },
  { name: "Welcome Girl", code: "DMM24", price: 1950, category: "Décor", specs: [{ label: "Height", value: "15 inch" }, { label: "Material", value: "Poly Resin" }] },
  { name: "Adiyogi Statue (Jodi Kuthirai)", code: "JUB15", price: 220, category: "Décor", specs: [{ label: "Height", value: "4.5 inch" }, { label: "Material", value: "Fiber" }] },
];

const categoryDescriptions: Record<string, string> = {
  Statues: "Handcrafted deity statues and idols in brass, German silver, and fine art finishes.",
  Buddha: "A curated collection of Buddha statues and figurines in varied styles and finishes.",
  Tanjore: "Traditional Thanjavur dancing dolls and clay art, handcrafted using age-old techniques.",
  "Diyas & Lamps": "Traditional brass diyas and vilakkus for pooja and festive occasions.",
  "Décor": "Decorative rangoli boards and traditional home décor pieces.",
};

async function main() {
  console.log("Seeding database...");

  // --- Admin user ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@cvrhandicrafts.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "CVR Admin",
      email: adminEmail,
      passwordHash,
      role: "SUPERADMIN",
    },
  });
  console.log(`Admin user ready: ${adminEmail} (change the password after first login)`);

  // --- Categories ---
  const categoryNames = Array.from(new Set(products.map((p) => p.category)));
  const categoryMap: Record<string, string> = {};

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const slug = slugify(name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        description: categoryDescriptions[name] ?? null,
        sortOrder: i,
        isActive: true,
      },
    });
    categoryMap[name] = category.id;
  }
  console.log(`Created ${categoryNames.length} categories.`);

  // --- Products ---
  let created = 0;
  for (const p of products) {
    const baseSlug = slugify(p.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        code: p.code || null,
        categoryId: categoryMap[p.category],
        price: p.price,
        description: p.description ?? null,
        shortDescription: p.description ? p.description.slice(0, 120) : null,
        stockQuantity: 10,
        inStock: true,
        isActive: true,
        isFeatured: created % 5 === 0, // sprinkle a few as featured so homepage isn't empty
        isNewArrival: created % 7 === 0,
        specifications: {
          create: p.specs.map((s, idx) => ({ label: s.label, value: s.value, sortOrder: idx })),
        },
        // Also create the many-to-many link for this product's category, so
        // it's immediately visible through category filtering on the shop
        // page (which queries via ProductCategory, not the legacy categoryId
        // column). Without this, freshly seeded products would silently be
        // invisible on every category filter.
        categories: {
          create: [{ categoryId: categoryMap[p.category] }],
        },
      },
    });
    created++;
  }

  console.log(`Created ${created} products.`);
  console.log("Seeding complete.");
  console.log("\nNOTE: Product images were NOT seeded automatically — the source PDFs contain");
  console.log("embedded photos, not standalone image files. Upload each product's photo via");
  console.log("Admin > Products > [product] > Images after seeding, using the real photos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
