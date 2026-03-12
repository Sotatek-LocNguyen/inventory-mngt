'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@inventory/types';
import { useLanguage } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get<Category[]>('/api/categories');
    setCategories(res.data);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setName('');
    setError('');
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setError('');
    setDialogOpen(true);
  }

  function openDelete(cat: Category) {
    setDeleting(cat);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    setError('');
    try {
      if (editing) {
        await api.put(`/api/categories/${editing.id}`, { name });
      } else {
        await api.post('/api/categories', { name });
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
      await api.delete(`/api/categories/${deleting.id}`);
      setDeleteDialogOpen(false);
      setDeleting(null);
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
          <h1 className="text-lg font-semibold text-gray-900">{t('categoriesTitle')}</h1>
          <p className="text-sm text-gray-500">{categories.length} {t('categoriesCount')}</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 bg-[#1677ff] hover:bg-[#0e5fd8] text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addCategory')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-16">{t('colId')}</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{t('colCategoryName')}</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3 w-32">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                <td className="px-4 py-2.5 text-sm text-gray-400">{cat.id}</td>
                <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{cat.name}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => openEdit(cat)} className="text-xs text-[#1677ff] hover:bg-blue-50 px-2 py-1 rounded transition-colors">{t('edit')}</button>
                    <button onClick={() => openDelete(cat)} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">{t('delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">
                  {t('noCategoriesYet')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('editCategory') : t('addCategory')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelCategoryName')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('labelCategoryName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">{t('cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-[#1677ff] hover:bg-[#0e5fd8] rounded-md transition-colors">{t('save')}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteCategory')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">{t('deleteCategoryConfirm')} <strong>{deleting?.name}</strong>?</p>
          <DialogFooter>
            <button onClick={() => setDeleteDialogOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">{t('cancel')}</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors">{t('delete')}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
