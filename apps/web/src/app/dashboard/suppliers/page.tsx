'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Supplier } from '@inventory/types';
import { useLanguage } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function SuppliersPage() {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get<Supplier[]>('/api/suppliers');
    setSuppliers(res.data);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setName('');
    setPhone('');
    setEmail('');
    setError('');
    setDialogOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setName(supplier.name);
    setPhone(supplier.phone ?? '');
    setEmail(supplier.email ?? '');
    setError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    setError('');
    const payload = {
      name,
      phone: phone || undefined,
      email: email || undefined,
    };
    try {
      if (editing) {
        await api.put(`/api/suppliers/${editing.id}`, payload);
      } else {
        await api.post('/api/suppliers', payload);
      }
      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? t('saveFailed'));
    }
  }

  async function handleDelete(supplier: Supplier) {
    if (!confirm(`${t('deleteSupplier')} "${supplier.name}"?`)) return;
    try {
      await api.delete(`/api/suppliers/${supplier.id}`);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error ?? t('deleteFailed'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{t('suppliersTitle')}</h1>
          <p className="text-sm text-gray-500">{suppliers.length} {t('suppliersCount')}</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 bg-[#1677ff] hover:bg-[#0e5fd8] text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addSupplier')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colSupplierName')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colPhone')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colEmail')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3 w-32">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={s.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{s.name}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600">{s.phone ?? '—'}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600">{s.email ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => openEdit(s)} className="text-xs text-[#1677ff] hover:bg-blue-50 px-2 py-1 rounded transition-colors">{t('edit')}</button>
                    <button onClick={() => handleDelete(s)} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">{t('delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">{t('noSuppliers')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('editSupplier') : t('addSupplier')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelSupplierName')} <span className="text-red-500">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('labelSupplierName')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelPhone')}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('labelPhone')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('colEmail')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">{t('cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-[#1677ff] hover:bg-[#0e5fd8] rounded-md transition-colors">{t('save')}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
