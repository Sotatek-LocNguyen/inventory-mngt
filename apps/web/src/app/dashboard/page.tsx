'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Users, ClipboardList } from 'lucide-react';
import { api } from '@/lib/api';
import type { Transaction, PaginatedResponse } from '@inventory/types';
import { useLanguage } from '@/lib/i18n';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StockChart } from '@/components/dashboard/StockChart';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StockItem {
  id: number;
  sku: string;
  name: string;
  stockQty: number;
  lowStockAt: number | null;
  isLowStock: boolean;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [chartTx, setChartTx] = useState<Transaction[]>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    Promise.all([
      api.get<StockItem[]>('/api/reports/stock'),
      api.get<StockItem[]>('/api/reports/stock?lowStockOnly=true'),
      api.get<{ length: number }>('/api/suppliers'),
      api.get<{ total: number }>(`/api/reports/history?from=${today.toISOString()}&limit=1`),
      api.get<PaginatedResponse<Transaction>>('/api/transactions?limit=10'),
      api.get<PaginatedResponse<Transaction>>(
        `/api/reports/history?from=${sevenDaysAgo.toISOString()}&limit=500`
      ),
    ]).then(([stockRes, lowRes, suppRes, todayRes, txRes, chartRes]) => {
      setStockItems(stockRes.data);
      setTotalProducts(stockRes.data.length);
      setLowStockItems(lowRes.data);
      setTotalSuppliers((suppRes.data as unknown as unknown[]).length);
      setTodayCount(todayRes.data.total);
      setRecentTx(txRes.data.data);
      setChartTx(chartRes.data.data);
      setLoading(false);
    });
  }, []);

  function txTypeLabel(type: string) {
    if (type === 'STOCK_IN') return t('txStockIn');
    if (type === 'STOCK_OUT') return t('txStockOut');
    if (type === 'ADJUSTMENT') return t('txAdjustment');
    return type;
  }

  const TYPE_COLORS: Record<string, string> = {
    STOCK_IN: 'text-green-700 bg-green-50 border-green-200',
    STOCK_OUT: 'text-red-700 bg-red-50 border-red-200',
    ADJUSTMENT: 'text-orange-700 bg-orange-50 border-orange-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">{t('dashTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('dashSubtitle')}</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-1">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title={t('dashProducts')}
            value={totalProducts}
            description={t('dashProductsDesc')}
            icon={<Package className="w-[18px] h-[18px]" />}
            iconBg="bg-blue-50"
            iconColor="text-[#1677ff]"
            index={0}
          />
          <StatsCard
            title={t('dashLowStock')}
            value={lowStockItems.length}
            description={t('dashLowStockDesc')}
            icon={<AlertTriangle className="w-[18px] h-[18px]" />}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            valueColor="text-orange-600"
            index={1}
          />
          <StatsCard
            title={t('dashSuppliers')}
            value={totalSuppliers}
            description={t('dashSuppliersDesc')}
            icon={<Users className="w-[18px] h-[18px]" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            index={2}
          />
          <StatsCard
            title={t('dashToday')}
            value={todayCount}
            description={t('dashTodayDesc')}
            icon={<ClipboardList className="w-[18px] h-[18px]" />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            index={3}
          />
        </div>
      )}

      {/* Charts Row */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3">
            <CardContent className="pt-4">
              <Skeleton className="h-[280px]" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="pt-4">
              <Skeleton className="h-[280px]" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <StockChart data={stockItems} title={t('dashStockDistribution') ?? 'Stock Distribution'} />
          </div>
          <div className="lg:col-span-2">
            <TransactionChart
              transactions={chartTx}
              title={t('dashTxTrend') ?? 'Transaction Trend (7 days)'}
              labelIn={t('txStockIn')}
              labelOut={t('txStockOut')}
            />
          </div>
        </div>
      )}

      {/* Low stock alert - improved */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                {t('dashLowStockAlert')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockItems.map((item) => {
                  const ratio = item.lowStockAt ? item.stockQty / item.lowStockAt : 0;
                  const barColor =
                    ratio < 0.25 ? 'bg-red-500' : ratio < 0.5 ? 'bg-orange-500' : 'bg-yellow-500';
                  return (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-3 bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground truncate mr-2">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.stockQty} / {item.lowStockAt}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold">{t('dashRecentTx')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                      {t('colDate')}
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                      {t('colType')}
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                      {t('colProduct')}
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">
                      {t('colQty')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLORS[tx.type] ?? 'text-gray-700 bg-gray-50 border-gray-200'}`}
                        >
                          {txTypeLabel(tx.type)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground">
                        {tx.product?.name ?? tx.productId}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-right">
                        <span className={tx.type === 'STOCK_IN' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'STOCK_IN' ? '+' : '-'}
                          {tx.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentTx.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        {t('dashNoTx')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
