import { Router } from 'express';
import { prisma } from '../lib/db';

export const reportsRouter = Router();

// GET /api/reports/stock
reportsRouter.get('/stock', async (req, res, next) => {
  try {
    const lowStockOnly = req.query.lowStockOnly === 'true';
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    const mapped = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      unit: p.unit,
      stockQty: p.stockQty,
      lowStockAt: p.lowStockAt,
      isLowStock: p.lowStockAt != null && p.stockQty <= p.lowStockAt,
      category: p.category,
    }));

    const result = lowStockOnly ? mapped.filter((p) => p.isLowStock) : mapped;

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/history
reportsRouter.get('/history', async (req, res, next) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const where = {
      ...(productId ? { productId } : {}),
      ...(type ? { type: type as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { product: { include: { category: true } }, supplier: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ data, total, limit, offset });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/history/export — CSV download
reportsRouter.get('/history/export', async (req, res, next) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    const type = req.query.type as string | undefined;

    const where = {
      ...(productId ? { productId } : {}),
      ...(type ? { type: type as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      include: { product: true, supplier: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = transactions.map((t) =>
      [
        t.createdAt.toISOString(),
        t.type,
        t.product.sku,
        t.product.name,
        t.quantity,
        t.supplier?.name ?? '',
        t.note ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csv = ['Date,Type,Product SKU,Product Name,Quantity,Supplier,Note', ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});
