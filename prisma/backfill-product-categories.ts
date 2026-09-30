import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ONE-TIME DATA FIX — safe to run multiple times.
 *
 * Background: products can now belong to multiple categories via the
 * ProductCategory join table. Any product created before that feature was
 * wired up (via the original seed script, or via the admin panel before this
 * update) only has the legacy single `categoryId` column set, with NO
 * corresponding ProductCategory row.
 *
 * Since the Shop page and category filters now query through
 * ProductCategory exclusively, those older products would be invisible on
 * every category filter — even though they still have a valid categoryId.
 *
 * This script finds every product missing a ProductCategory link for its own
 * categoryId and creates it, so no existing product silently disappears.
 * It does NOT touch products that already have correct links, and it does
 * NOT delete or modify anything else.
 */
async function main() {
  const products = await prisma.product.findMany({
    include: { categories: true },
  });

  let fixed = 0;
  let alreadyOk = 0;
  let skippedNoCategory = 0;

  for (const product of products) {
    if (!product.categoryId) {
      skippedNoCategory++;
      continue;
    }

    const hasLink = product.categories.some(
      (link: (typeof product.categories)[number]) => link.categoryId === product.categoryId
    );

    if (hasLink) {
      alreadyOk++;
      continue;
    }

    await prisma.productCategory.create({
      data: {
        productId: product.id,
        categoryId: product.categoryId,
      },
    });
    fixed++;
    console.log(`Linked "${product.name}" -> its existing category (was missing).`);
  }

  console.log("\n--- Backfill complete ---");
  console.log(`Already correctly linked: ${alreadyOk}`);
  console.log(`Fixed (link created):     ${fixed}`);
  console.log(`Skipped (no categoryId):  ${skippedNoCategory}`);
  console.log(`Total products checked:   ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
