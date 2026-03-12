'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage, type Lang } from '@/lib/i18n';

const LANG_OPTIONS: { value: Lang; flag: string; label: string }[] = [
  { value: 'vi', flag: '🇻🇳', label: 'VI' },
  { value: 'en', flag: '🇺🇸', label: 'EN' },
  { value: 'kr', flag: '🇰🇷', label: 'KR' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    {
      href: '/dashboard',
      label: t('navOverview'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/dashboard/products',
      label: t('navProducts'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: '/dashboard/categories',
      label: t('navCategories'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/suppliers',
      label: t('navSuppliers'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/transactions',
      label: t('navTransactions'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: '/dashboard/reports/stock',
      label: t('navStock'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/reports/history',
      label: t('navHistory'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  async function handleLogout() {
    await api.post('/auth/logout');
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header bar */}
      <header className="h-12 bg-[#1677ff] flex items-center px-2 sm:px-4 gap-2 sm:gap-4 shrink-0 z-10">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-white p-1.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-white font-bold text-base tracking-wide">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {t('appName')}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 bg-white/10 rounded-md p-0.5">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLang(opt.value)}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors font-medium',
                  lang === opt.value
                    ? 'bg-white text-[#1677ff]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {opt.flag} {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-white text-sm ml-1">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <span className="hidden sm:block opacity-90">{t('admin')}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/80 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
          >
            {t('logout')}
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-12 bg-black/30 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left sidebar */}
        <aside
          className={cn(
            'w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200',
            'fixed top-12 bottom-0 z-30 md:static md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="flex flex-col p-2 gap-0.5 flex-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 text-[#1677ff] font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <span className={cn(isActive ? 'text-[#1677ff]' : 'text-gray-400')}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
            Inventory v1.0
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-3 sm:p-5 overflow-auto min-w-0">{children}</main>
      </div>
    </div>
  );
}
