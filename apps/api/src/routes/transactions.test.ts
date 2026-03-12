import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { transactionsRouter } from './transactions';
import { productsRouter } from './products';
import { categoriesRouter } from './categories';
import { requireAuth } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';

// Use the test DB URL set via vitest config env
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// Build a minimal test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET ?? 'test-secret');
// Inject auth cookie for all test requests via helper
app.use('/api/categories', requireAuth, categoriesRouter);
app.use('/api/products', requireAuth, productsRouter);
app.use('/api/transactions', requireAuth, transactionsRouter);
app.use(errorHandler);

let server: ReturnType<typeof app.listen>;
let baseUrl: string;
let authCookie: string;

beforeAll(async () => {
  server = app.listen(0); // random port
  const addr = server.address() as { port: number };
  baseUrl = `http://localhost:${addr.port}`;
  authCookie = `token=${token}`;
});

beforeEach(async () => {
  // Clean DB in reverse dependency order
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
});

async function req(method: string, path: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function createCategory() {
  const r = await req('POST', '/api/categories', { name: 'Test Category' });
  return r.body as { id: number };
}

async function createProduct(categoryId: number) {
  const r = await req('POST', '/api/products', {
    sku: 'TEST-001',
    name: 'Test Product',
    unit: 'pcs',
    costPrice: 10,
    salePrice: 15,
    categoryId,
  });
  return r.body as { id: number; stockQty: number };
}

describe('POST /api/transactions', () => {
  it('STOCK_IN of 10 → stockQty becomes 10', async () => {
    const cat = await createCategory();
    const product = await createProduct(cat.id);

    const r = await req('POST', '/api/transactions', {
      type: 'STOCK_IN',
      productId: product.id,
      quantity: 10,
    });

    expect(r.status).toBe(201);

    const p = await req('GET', `/api/products/${product.id}`);
    expect(p.body.stockQty).toBe(10);
  });

  it('STOCK_OUT of 3 after STOCK_IN of 10 → stockQty becomes 7', async () => {
    const cat = await createCategory();
    const product = await createProduct(cat.id);

    await req('POST', '/api/transactions', { type: 'STOCK_IN', productId: product.id, quantity: 10 });
    const r = await req('POST', '/api/transactions', { type: 'STOCK_OUT', productId: product.id, quantity: 3 });

    expect(r.status).toBe(201);

    const p = await req('GET', `/api/products/${product.id}`);
    expect(p.body.stockQty).toBe(7);
  });

  it('STOCK_OUT of 8 when stock is 7 → 400 Insufficient stock', async () => {
    const cat = await createCategory();
    const product = await createProduct(cat.id);

    await req('POST', '/api/transactions', { type: 'STOCK_IN', productId: product.id, quantity: 7 });
    const r = await req('POST', '/api/transactions', { type: 'STOCK_OUT', productId: product.id, quantity: 8 });

    expect(r.status).toBe(400);
    expect(r.body.error).toMatch(/insufficient stock/i);

    const p = await req('GET', `/api/products/${product.id}`);
    expect(p.body.stockQty).toBe(7); // unchanged
  });

  it('ADJUSTMENT without note → 400 validation error', async () => {
    const cat = await createCategory();
    const product = await createProduct(cat.id);

    const r = await req('POST', '/api/transactions', {
      type: 'ADJUSTMENT',
      productId: product.id,
      quantity: 2,
    });

    expect(r.status).toBe(400);
  });
});

describe('GET /api/transactions', () => {
  it('?productId filters to only that product\'s transactions', async () => {
    const cat = await createCategory();
    const p1 = await createProduct(cat.id);
    const p2 = await req('POST', '/api/products', {
      sku: 'TEST-002',
      name: 'Second Product',
      unit: 'box',
      costPrice: 5,
      salePrice: 8,
      categoryId: cat.id,
    });
    const product2 = p2.body as { id: number };

    await req('POST', '/api/transactions', { type: 'STOCK_IN', productId: p1.id, quantity: 10 });
    await req('POST', '/api/transactions', { type: 'STOCK_IN', productId: product2.id, quantity: 5 });

    const r = await req('GET', `/api/transactions?productId=${p1.id}`);

    expect(r.status).toBe(200);
    expect(r.body.data).toHaveLength(1);
    expect(r.body.data[0].productId).toBe(p1.id);
  });
});
