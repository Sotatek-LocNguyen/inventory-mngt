'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { Product, Supplier } from '@inventory/types';
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  suppliers: Supplier[];
  onSuccess: () => void;
}

export function NewTransactionDialog({ open, onOpenChange, products, suppliers, onSuccess }: Props) {
  const { t } = useLanguage();
  const [type, setType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'>('STOCK_IN');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [stockError, setStockError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setType('STOCK_IN');
    setProductId('');
    setQuantity('');
    setSupplierId('');
    setNote('');
    setStockError('');
    setError('');
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStockError('');
    setError('');

    if (type === 'ADJUSTMENT' && !note.trim()) {
      setError(t('adjustmentNoteRequired'));
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/transactions', {
        type,
        productId: Number(productId),
        quantity: Number(quantity),
        supplierId: supplierId ? Number(supplierId) : undefined,
        note: note || undefined,
      });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string }; status?: number } };
      const msg = e.response?.data?.error ?? '';
      if (msg.toLowerCase().includes('insufficient')) {
        setStockError(msg);
      } else {
        setError(msg || t('createTxFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedProduct = products.find((p) => String(p.id) === productId);

  const txTypes = [
    { value: 'STOCK_IN', label: t('txStockIn') },
    { value: 'STOCK_OUT', label: t('txStockOut') },
    { value: 'ADJUSTMENT', label: t('txAdjustment') },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('newTxTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelTxType')} <span className="text-red-500">*</span></label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {txTypes.map((tx) => (
                  <SelectItem key={tx.value} value={tx.value}>{tx.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelProduct')} <span className="text-red-500">*</span></label>
            <Select value={productId} onValueChange={(v) => { setProductId(v ?? ''); setStockError(''); }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={t('labelProduct')} />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.sku} — {p.name} ({t('stockLabel')}: {p.stockQty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-xs text-gray-500 mt-1">{t('currentStock')}: <strong>{selectedProduct.stockQty}</strong></p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelQty')} <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setStockError(''); }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {stockError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {stockError}
              </p>
            )}
          </div>

          {type === 'STOCK_IN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelSupplier')}</label>
              <Select value={supplierId} onValueChange={(v) => setSupplierId(v ?? '')}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t('supplierOptional')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('labelNote')} {type === 'ADJUSTMENT' ? <span className="text-red-500">*</span> : <span className="text-gray-400">({t('optional')})</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={type === 'ADJUSTMENT' ? t('noteRequired') : t('noteOptional')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !productId || !quantity}
              className="px-4 py-2 text-sm text-white bg-[#1677ff] hover:bg-[#0e5fd8] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('savingTx') : t('createTxBtn')}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
