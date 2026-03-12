import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';

export const productsRouter = Router();

const productSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  unit: z.string().min(1).max(20),
  costPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  categoryId: z.number().int().positive(),
  lowStockAt: z.number().int().nonnegative().optional(),
});

productsRouter.get('/', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = productSchema.parse(req.body);
    const product = await prisma.product.create({ data: parsed, include: { category: true } });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id },
      data: parsed,
      include: { category: true },
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
