'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { Transaction } from '@inventory/types';

interface TransactionChartProps {
  transactions: Transaction[];
  title: string;
  labelIn: string;
  labelOut: string;
}

export function TransactionChart({ transactions, title, labelIn, labelOut }: TransactionChartProps) {
  const days = buildLast7Days(transactions);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={days} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stockIn"
                  name={labelIn}
                  stroke="#22c55e"
                  fill="url(#gradIn)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="stockOut"
                  name={labelOut}
                  stroke="#ef4444"
                  fill="url(#gradOut)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function buildLast7Days(transactions: Transaction[]) {
  const result: { date: string; stockIn: number; stockOut: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    result.push({ date: key, stockIn: 0, stockOut: 0 });
  }

  for (const tx of transactions) {
    const txDate = new Date(tx.createdAt).toISOString().slice(5, 10);
    const bucket = result.find((r) => r.date === txDate);
    if (!bucket) continue;
    if (tx.type === 'STOCK_IN') bucket.stockIn += tx.quantity;
    else if (tx.type === 'STOCK_OUT') bucket.stockOut += tx.quantity;
  }

  return result;
}
