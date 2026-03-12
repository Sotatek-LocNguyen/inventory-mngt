'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@inventory/types';
import { useLanguage } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StockItem {
  id: number;
  sku: string;
  name: string;
  unit: string;
  stockQty: number;
  lowStockAt: number | null;
  isLowStock: boolean;
  category: Category;
}

export default function StockReportPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [categoryId, setCategoryId] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (lowStockOnly) params.set('lowStockOnly', 'true');
    if (categoryId) params.set('categoryId', categoryId);
    const res = await api.get<StockItem[]>(`/api/reports/stock?${params}`);
    setItems(res.data);
  }, [lowStockOnly, categoryId]);

  useEffect(() => {
    api.get<Category[]>('/api/categories').then((r) => setCategories(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const lowStockCount = items.filter((i) => i.isLowStock).length;
  const outOfStockCount = items.filter((i) => i.stockQty === 0).length;

  function stockStatusLabel(item: StockItem) {
    if (item.stockQty === 0) return t('stockOutStatus');
    if (item.isLowStock) return t('stockLowStatus');
    return t('stockInStatus');
  }

  function stockStatusClass(item: StockItem) {
    if (item.stockQty === 0) return 'text-red-700 bg-red-50 border-red-200';
    if (item.isLowStock) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-green-700 bg-green-50 border-green-200';
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{t('stockTitle')}</h1>
        <p className="text-sm text-gray-500">{t('stockSubtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xl font-bold text-gray-900">{items.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">{t('stockTotal')}</div>
        </div>
        <div className="bg-white rounded-lg border border-orange-200 p-3 text-center">
          <div className="text-xl font-bold text-orange-600">{lowStockCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">{t('stockLowCount')}</div>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-3 text-center">
          <div className="text-xl font-bold text-red-600">{outOfStockCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">{t('stockOutCount')}</div>
        </div>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          {t('showLowOnly')}
        </label>

        <Select value={categoryId} onValueChange={(v) => setCategoryId(v === 'ALL' ? '' : (v ?? ''))}>
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder={t('filterAllCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filterAllCategories')}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colSku')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colName')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colCategory')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colUnit')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{t('colStock')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{t('colThreshold')}</th>
              <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">{t('colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{item.sku}</td>
                <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{item.name}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600">{item.category?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600">{item.unit}</td>
                <td className="px-4 py-2.5 text-sm font-semibold text-right">
                  <span className={item.stockQty === 0 ? 'text-red-600' : item.isLowStock ? 'text-orange-600' : 'text-green-600'}>
                    {item.stockQty}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-sm text-gray-500 text-right">{item.lowStockAt ?? '—'}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${stockStatusClass(item)}`}>
                    {stockStatusLabel(item)}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">{t('noStockItems')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
