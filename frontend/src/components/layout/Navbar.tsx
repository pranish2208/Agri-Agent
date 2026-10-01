'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Globe, Sparkles, Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/50 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 p-2 shadow-md flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-emerald-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-200 via-white to-green-300 bg-clip-text text-transparent">
                  {t('app.title')}
                </span>
                <span className="hidden sm:inline-block text-xs font-medium text-emerald-300 ml-2 px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-700/60">
                  {t('app.tagline')}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Hackathon Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-900/90 border border-emerald-700 text-xs text-emerald-200 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t('app.hackathonBadge')}</span>
            </div>

            {/* Language Switcher UI */}
            <div className="flex items-center bg-emerald-900/80 p-1 rounded-xl border border-emerald-700/70 shadow-inner">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  language === 'ta'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* AI Online Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">AI System Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
