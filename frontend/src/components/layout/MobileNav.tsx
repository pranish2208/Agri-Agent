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
  X,
  Sparkles,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
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

  const quickBottomItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Farm', href: '/my-farm', icon: MapPin },
    { name: 'Ask AI', href: '/ask', icon: Bot, highlight: true },
    { name: 'Health', href: '/crop-health', icon: Stethoscope },
    { name: 'Weather', href: '/weather', icon: CloudSun },
  ];

  return (
    <>
      {/* Slide-out Drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
          
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-slate-900 shadow-2xl p-4 flex flex-col border-r border-emerald-800/60 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                  Ag
                </div>
                <span className="font-bold text-white text-lg">AgriAgent Menu</span>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="mt-4 space-y-2 flex-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      item.highlight
                        ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-slate-950 font-bold shadow-md'
                        : isActive
                        ? 'bg-emerald-800/70 text-emerald-200 border-l-4 border-emerald-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.highlight && <Sparkles className="w-4 h-4 ml-auto text-amber-300" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Fixed Bottom Touch Bar for Phones */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-emerald-900/60 py-2 px-3 shadow-2xl">
        <div className="flex items-center justify-around">
          {quickBottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 p-2.5 shadow-lg ring-4 ring-slate-950 flex items-center justify-center text-slate-950 font-bold transform active:scale-95 transition-transform">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-1">{item.name}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
