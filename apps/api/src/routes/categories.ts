import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1).max(100),
});

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post('/', async (req, res, next) => {
  try {
    const parsed = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data: parsed });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = categorySchema.parse(req.body);
    const category = await prisma.category.update({ where: { id }, data: parsed });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with linked products' });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
