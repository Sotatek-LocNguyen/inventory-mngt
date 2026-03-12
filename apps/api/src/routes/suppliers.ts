import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';

export const suppliersRouter = Router();

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

suppliersRouter.get('/', async (_req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
});

suppliersRouter.post('/', async (req, res, next) => {
  try {
    const parsed = supplierSchema.parse(req.body);
    const supplier = await prisma.supplier.create({ data: parsed });
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
});

suppliersRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = supplierSchema.parse(req.body);
    const supplier = await prisma.supplier.update({ where: { id }, data: parsed });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
});

suppliersRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const count = await prisma.transaction.count({ where: { supplierId: id } });
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete supplier with linked transactions' });
    }
    await prisma.supplier.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
