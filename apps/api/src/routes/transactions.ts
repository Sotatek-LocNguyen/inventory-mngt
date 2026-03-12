import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';

export const transactionsRouter = Router();

const transactionSchema = z
  .object({
    type: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT']),
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    supplierId: z.number().int().positive().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => data.type !== 'ADJUSTMENT' || (data.note && data.note.trim().length > 0),
    { message: 'Note is required for ADJUSTMENT transactions', path: ['note'] }
  );

transactionsRouter.get('/', async (req, res, next) => {
  try {
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const where = {
      ...(productId ? { productId } : {}),
      ...(type ? { type: type as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { product: true, supplier: true },
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

transactionsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = transactionSchema.parse(req.body);

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({ where: { id: parsed.productId } });

      if (parsed.type === 'STOCK_OUT' && product.stockQty < parsed.quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const delta = parsed.type === 'STOCK_IN' ? parsed.quantity : -parsed.quantity;

      await tx.product.update({
        where: { id: parsed.productId },
        data: { stockQty: { increment: delta } },
      });

      return tx.transaction.create({
        data: {
          type: parsed.type,
          productId: parsed.productId,
          quantity: parsed.quantity,
          supplierId: parsed.supplierId,
          note: parsed.note,
        },
        include: { product: true, supplier: true },
      });
    });

    res.status(201).json(created);
  } catch (err) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: 'Insufficient stock for this product' });
    }
    next(err);
  }
});
