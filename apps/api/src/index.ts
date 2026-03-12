import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { categoriesRouter } from './routes/categories';
import { suppliersRouter } from './routes/suppliers';
import { productsRouter } from './routes/products';
import { transactionsRouter } from './routes/transactions';
import { reportsRouter } from './routes/reports';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/api/categories', requireAuth, categoriesRouter);
app.use('/api/suppliers', requireAuth, suppliersRouter);
app.use('/api/products', requireAuth, productsRouter);
app.use('/api/transactions', requireAuth, transactionsRouter);
app.use('/api/reports', requireAuth, reportsRouter);

app.use(errorHandler);
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
