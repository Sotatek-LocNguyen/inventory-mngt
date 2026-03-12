'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Transaction, Supplier, PaginatedResponse } from '@inventory/types';
import { useLanguage } from '@/lib/i18n';

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
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Promise.all([
      api.get<StockItem[]>('/api/reports/stock'),
      api.get<StockItem[]>('/api/reports/stock?lowStockOnly=true'),
      api.get<Supplier[]>('/api/suppliers'),
      api.get<{ total: number }>(`/api/reports/history?from=${today.toISOString()}&limit=1`),
      api.get<PaginatedResponse<Transaction>>('/api/transactions?limit=10'),
    ]).then(([stockRes, lowRes, suppRes, todayRes, txRes]) => {
      setTotalProducts(stockRes.data.length);
      setLowStockItems(lowRes.data);
      setTotalSuppliers(suppRes.data.length);
      setTodayCount(todayRes.data.total);
      setRecentTx(txRes.data.data);
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
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{t('dashTitle')}</h1>
        <p className="text-sm text-gray-500">{t('dashSubtitle')}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashProducts')}</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1677ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalProducts ?? '—'}</div>
          <div className="text-xs text-gray-500 mt-1">{t('dashProductsDesc')}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashLowStock')}</span>
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600">{lowStockItems.length ?? '—'}</div>
          <div className="text-xs text-gray-500 mt-1">{t('dashLowStockDesc')}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashSuppliers')}</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalSuppliers ?? '—'}</div>
          <div className="text-xs text-gray-500 mt-1">{t('dashSuppliersDesc')}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashToday')}</span>
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{todayCount ?? '—'}</div>
          <div className="text-xs text-gray-500 mt-1">{t('dashTodayDesc')}</div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-orange-800">{t('dashLowStockAlert')}</span>
          </div>
          <div className="space-y-1.5">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{item.name}</span>
                <span className="text-orange-700 font-medium">
                  {t('dashRemaining')} {item.stockQty} / {t('dashThreshold')} {item.lowStockAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{t('dashRecentTx')}</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">{t('colDate')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">{t('colType')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">{t('colProduct')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-2.5">{t('colQty')}</th>
            </tr>
          </thead>
          <tbody>
            {recentTx.map((tx, i) => (
              <tr key={tx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLORS[tx.type] ?? 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                    {txTypeLabel(tx.type)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-sm text-gray-700">{tx.product?.name ?? tx.productId}</td>
                <td className="px-4 py-2.5 text-sm font-medium text-right">
                  <span className={tx.type === 'STOCK_IN' ? 'text-green-600' : 'text-red-600'}>
                    {tx.type === 'STOCK_IN' ? '+' : '-'}{tx.quantity}
                  </span>
                </td>
              </tr>
            ))}
            {recentTx.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                  {t('dashNoTx')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
