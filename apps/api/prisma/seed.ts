import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Categories ──────────────────────────────────────────────────────────────
  const [catWhole, catParts, catSides, catPack] = await Promise.all([
    prisma.category.upsert({ where: { name: 'Whole Chicken' }, update: {}, create: { name: 'Whole Chicken' } }),
    prisma.category.upsert({ where: { name: 'Chicken Parts' }, update: {}, create: { name: 'Chicken Parts' } }),
    prisma.category.upsert({ where: { name: 'Sides & Sauces' }, update: {}, create: { name: 'Sides & Sauces' } }),
    prisma.category.upsert({ where: { name: 'Packaging' }, update: {}, create: { name: 'Packaging' } }),
  ]);

  // ── Suppliers ────────────────────────────────────────────────────────────────
  const [supGolden, supFresh, supPack] = await Promise.all([
    prisma.supplier.upsert({
      where: { id: 1 }, update: {},
      create: { name: 'Golden Farm Poultry', phone: '0901 234 567', email: 'orders@goldenfarm.vn' },
    }),
    prisma.supplier.upsert({
      where: { id: 2 }, update: {},
      create: { name: 'Fresh Wing Co.', phone: '0912 345 678', email: 'supply@freshwing.vn' },
    }),
    prisma.supplier.upsert({
      where: { id: 3 }, update: {},
      create: { name: 'Pack & Go Supplies', phone: null, email: 'hello@packgo.vn' },
    }),
  ]);

  // ── Products ─────────────────────────────────────────────────────────────────
  const products = [
    { sku: 'WC-001', name: 'Whole Chicken (1kg)',   unit: 'kg',     costPrice: 45000, salePrice: 65000, lowStockAt: 20, categoryId: catWhole.id },
    { sku: 'WC-002', name: 'Whole Chicken (1.5kg)', unit: 'kg',     costPrice: 65000, salePrice: 90000, lowStockAt: 15, categoryId: catWhole.id },
    { sku: 'CP-001', name: 'Drumstick',             unit: 'piece',  costPrice: 12000, salePrice: 18000, lowStockAt: 50, categoryId: catParts.id },
    { sku: 'CP-002', name: 'Chicken Wing',          unit: 'piece',  costPrice: 10000, salePrice: 15000, lowStockAt: 50, categoryId: catParts.id },
    { sku: 'CP-003', name: 'Chicken Thigh',         unit: 'piece',  costPrice: 14000, salePrice: 20000, lowStockAt: 30, categoryId: catParts.id },
    { sku: 'CP-004', name: 'Chicken Breast',        unit: 'piece',  costPrice: 16000, salePrice: 25000, lowStockAt: 30, categoryId: catParts.id },
    { sku: 'SS-001', name: 'Signature Dipping Sauce', unit: 'bottle', costPrice: 8000, salePrice: 15000, lowStockAt: 20, categoryId: catSides.id },
    { sku: 'SS-002', name: 'Spicy Marinade',        unit: 'bottle', costPrice: 10000, salePrice: 18000, lowStockAt: 20, categoryId: catSides.id },
    { sku: 'SS-003', name: 'Coleslaw (200g)',        unit: 'box',    costPrice: 5000,  salePrice: 12000, lowStockAt: 15, categoryId: catSides.id },
    { sku: 'PK-001', name: 'Paper Box (Small)',     unit: 'pack',   costPrice: 2000,  salePrice: 5000,  lowStockAt: 100, categoryId: catPack.id },
    { sku: 'PK-002', name: 'Paper Box (Large)',     unit: 'pack',   costPrice: 3000,  salePrice: 7000,  lowStockAt: 100, categoryId: catPack.id },
    { sku: 'PK-003', name: 'Kraft Bag',             unit: 'pack',   costPrice: 1500,  salePrice: 4000,  lowStockAt: 100, categoryId: catPack.id },
  ];

  const createdProducts = await Promise.all(
    products.map((p) =>
      prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: p,
      })
    )
  );

  // ── Initial stock-in transactions ────────────────────────────────────────────
  const openingQty: Record<string, number> = {
    'WC-001': 50, 'WC-002': 30,
    'CP-001': 200, 'CP-002': 200, 'CP-003': 120, 'CP-004': 120,
    'SS-001': 60, 'SS-002': 60, 'SS-003': 40,
    'PK-001': 500, 'PK-002': 300, 'PK-003': 400,
  };

  const supplierBySku: Record<string, number> = {
    'WC-001': supGolden.id, 'WC-002': supGolden.id,
    'CP-001': supFresh.id,  'CP-002': supFresh.id,
    'CP-003': supFresh.id,  'CP-004': supFresh.id,
    'SS-001': supGolden.id, 'SS-002': supGolden.id, 'SS-003': supGolden.id,
    'PK-001': supPack.id,   'PK-002': supPack.id,   'PK-003': supPack.id,
  };

  for (const product of createdProducts) {
    const qty = openingQty[product.sku];
    const existing = await prisma.transaction.findFirst({
      where: { productId: product.id, type: TransactionType.STOCK_IN, note: 'Opening stock' },
    });
    if (!existing) {
      await prisma.transaction.create({
        data: {
          type: TransactionType.STOCK_IN,
          productId: product.id,
          quantity: qty,
          supplierId: supplierBySku[product.sku],
          note: 'Opening stock',
        },
      });
      await prisma.product.update({
        where: { id: product.id },
        data: { stockQty: qty },
      });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
