import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) return res.status(400).json({ error: err.flatten() });
  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate value — record already exists' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
