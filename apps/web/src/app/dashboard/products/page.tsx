'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category, Product } from '@inventory/types';
import { useLanguage } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const emptyForm = {
  sku: '',
  name: '',
  unit: '',
  costPrice: '',
  salePrice: '',
  categoryId: '',
  lowStockAt: '',
};

export default function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    const [prodRes, catRes] = await Promise.all([
      api.get<Product[]>('/api/products'),
      api.get<Category[]>('/api/categories'),
    ]);
    setProducts(prodRes.data);
    setCategories(catRes.data);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      sku: p.sku,
      name: p.name,
      unit: p.unit,
      costPrice: String(p.costPrice),
      salePrice: String(p.salePrice),
      categoryId: String(p.categoryId),
      lowStockAt: p.lowStockAt != null ? String(p.lowStockAt) : '',
    });
    setError('');
    setDialogOpen(true);
  }

  function field(key: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave() {
    setError('');
    const payload = {
      sku: form.sku,
      name: form.name,
      unit: form.unit,
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      categoryId: Number(form.categoryId),
      lowStockAt: form.lowStockAt ? Number(form.lowStockAt) : undefined,
    };
    try {
      if (editing) {
        await api.put(`/api/products/${editing.id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? t('saveFailed'));
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api.delete(`/api/products/${deleting.id}`);
      setDeleteDialogOpen(false);
      setDeleting(null);
      load();
    } catch {
      alert(t('deleteFailed'));
    }
  }

  function isLowStock(p: Product) {
    return p.lowStockAt != null && p.stockQty <= p.lowStockAt;
  }

  const fmtPrice = (v: number | string) =>
    Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{t('productsTitle')}</h1>
          <p className="text-sm text-gray-500">{products.length} {t('productsCount')}</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 bg-[#1677ff] hover:bg-[#0e5fd8] text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addProduct')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colSku')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colName')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colCategory')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colUnit')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{t('colCostPrice')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{t('colSalePrice')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{t('colStock')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3 w-32">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{p.sku}</td>
                <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600">{p.unit}</td>
                <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{fmtPrice(p.costPrice)}</td>
                <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{fmtPrice(p.salePrice)}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-sm font-medium ${p.stockQty === 0 ? 'text-red-600' : isLowStock(p) ? 'text-orange-600' : 'text-green-600'}`}>
                      {p.stockQty}
                    </span>
                    {isLowStock(p) && (
                      <span className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                        {t('stockLow')}
                      </span>
                    )}
                    {p.stockQty === 0 && (
                      <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        {t('stockOut')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => openEdit(p)} className="text-xs text-[#1677ff] hover:bg-blue-50 px-2 py-1 rounded transition-colors">{t('edit')}</button>
                    <button onClick={() => { setDeleting(p); setDeleteDialogOpen(true); }} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">{t('delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">{t('noProducts')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('editProduct') : t('addProduct')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelSku')} <span className="text-red-500">*</span></label>
              <input value={form.sku} onChange={field('sku')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelName')} <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={field('name')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelUnit')} <span className="text-red-500">*</span></label>
              <input value={form.unit} onChange={field('unit')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('colCategory')} <span className="text-red-500">*</span></label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? '' }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t('colCategory')}>
                    {(v: string) => categories.find((c) => String(c.id) === v)?.name ?? v}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelCostPrice')} <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="1000" value={form.costPrice} onChange={field('costPrice')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelSalePrice')} <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="1000" value={form.salePrice} onChange={field('salePrice')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelLowStockAlert')}</label>
              <input type="number" min="0" value={form.lowStockAt} onChange={field('lowStockAt')} placeholder={t('optional')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">{t('cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-[#1677ff] hover:bg-[#0e5fd8] rounded-md transition-colors">{t('save')}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteProduct')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {t('delete')} <strong>{deleting?.name}</strong>? {t('deleteProductConfirm')}
          </p>
          <DialogFooter>
            <button onClick={() => setDeleteDialogOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">{t('cancel')}</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors">{t('delete')}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
