'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import {
  Home,
  MapPin,
  BookOpen,
  Bot,
  Stethoscope,
  TestTube2,
  CloudSun,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.myFarm'), href: '/my-farm', icon: MapPin },
    { name: t('nav.cropLibrary'), href: '/crops', icon: BookOpen },
    { name: t('nav.askAgriAgent'), href: '/ask', icon: Bot, highlight: true },
    { name: t('nav.cropHealth'), href: '/crop-health', icon: Stethoscope },
    { name: t('nav.soil'), href: '/soil', icon: TestTube2 },
    { name: t('nav.weather'), href: '/weather', icon: CloudSun },
    { name: t('nav.market'), href: '/market', icon: TrendingUp },
    { name: t('nav.cropCalendar'), href: '/calendar', icon: Calendar },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-emerald-900/40 min-h-[calc(100vh-4rem)] p-4 shadow-xl select-none">
      {/* Quick Navigation Title */}
      <div className="px-3 py-2 text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">
        Main Navigation
      </div>

      <nav className="mt-2 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-xl transition-all shadow-md ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 text-slate-950 font-bold shadow-emerald-900/50'
                    : 'bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/60 text-emerald-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-800/80 text-emerald-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'} animate-pulse`} />
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-800/60 text-emerald-100 font-semibold border-l-4 border-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Farm Status Card */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-emerald-900/50 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="font-semibold text-emerald-400">Thanjavur Farm</span>
            <span className="px-1.5 py-0.5 bg-emerald-900/80 text-emerald-300 rounded text-[10px]">4.5 Acres</span>
          </div>
          <p className="text-slate-400 text-[11px]">Soil: Clay Loam (pH 6.8)</p>
          <div className="mt-2 text-[10px] text-emerald-400/80 font-mono">
            Backend API: <span className="text-emerald-300">{process.env.NEXT_PUBLIC_API_URL ? 'Connected' : 'Fallback Ready'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
