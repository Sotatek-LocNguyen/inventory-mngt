'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Transaction, Product, Supplier, PaginatedResponse } from '@inventory/types';
import { useLanguage } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewTransactionDialog } from '@/components/transactions/NewTransactionDialog';

const LIMIT = 50;

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [result, setResult] = useState<PaginatedResponse<Transaction>>({ data: [], total: 0, limit: LIMIT, offset: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [offset, setOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterProductId) params.set('productId', filterProductId);
    params.set('limit', String(LIMIT));
    params.set('offset', String(offset));
    const res = await api.get<PaginatedResponse<Transaction>>(`/api/transactions?${params}`);
    setResult(res.data);
  }, [filterType, filterProductId, offset]);

  useEffect(() => {
    api.get<Product[]>('/api/products').then((r) => setProducts(r.data));
    api.get<Supplier[]>('/api/suppliers').then((r) => setSuppliers(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  function applyFilters() {
    setOffset(0);
    load();
  }

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

  const totalPages = Math.ceil(result.total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{t('txTitle')}</h1>
          <p className="text-sm text-gray-500">{result.total} {t('txCount')}</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#1677ff] hover:bg-[#0e5fd8] text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('createTx')}
        </button>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <Select value={filterType} onValueChange={(v) => setFilterType(v === 'ALL' ? '' : (v ?? ''))}>
          <SelectTrigger className="w-full sm:w-40 h-8 text-sm">
            <SelectValue placeholder={t('filterAllTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filterAllTypes')}</SelectItem>
            <SelectItem value="STOCK_IN">{t('txStockIn')}</SelectItem>
            <SelectItem value="STOCK_OUT">{t('txStockOut')}</SelectItem>
            <SelectItem value="ADJUSTMENT">{t('txAdjustment')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterProductId} onValueChange={(v) => setFilterProductId(v === 'ALL' ? '' : (v ?? ''))}>
          <SelectTrigger className="w-full sm:w-52 h-8 text-sm">
            <SelectValue placeholder={t('filterAllProducts')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filterAllProducts')}</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.sku} — {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button onClick={applyFilters} className="h-8 px-3 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          {t('filterBtn')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colDate')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colType')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colProduct')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{t('colQty')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colSupplier')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colNote')}</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((tx, i) => (
              <tr key={tx.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
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
                <td className="px-4 py-2.5 text-sm text-gray-600">{tx.supplier?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{tx.note ?? '—'}</td>
              </tr>
            ))}
            {result.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">{t('noTx')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result.total > LIMIT && (
        <div className="flex items-center gap-3">
          <button disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - LIMIT))} className="h-8 px-3 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {t('pagePrev')}
          </button>
          <span className="text-sm text-gray-500">
            {t('pagePrefix')} {currentPage} {t('pageOf')} {totalPages}
          </span>
          <button disabled={offset + LIMIT >= result.total} onClick={() => setOffset((o) => o + LIMIT)} className="h-8 px-3 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {t('pageNext')}
          </button>
        </div>
      )}

      <NewTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products}
        suppliers={suppliers}
        onSuccess={() => {
          load();
          api.get<Product[]>('/api/products').then((r) => setProducts(r.data));
        }}
      />
    </div>
  );
}
