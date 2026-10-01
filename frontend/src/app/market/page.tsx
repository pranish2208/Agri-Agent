'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_MARKETS } from '../../data/mockData';
import { getMarketData } from '../../services/api';
import { MarketItem } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Store,
  DollarSign,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { ViewDetailsModal } from '../../components/ui/ViewDetailsModal';

export default function MarketPage() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKETS);

  useEffect(() => {
    async function loadMarketData() {
      try {
        const liveMarkets = await getMarketData('Tomato');
        if (liveMarkets && liveMarkets.length > 0) {
          setMarkets(liveMarkets);
        }
      } catch (err) {
        console.warn('Failed loading live market data:', err);
      }
    }
    loadMarketData();
  }, []);

  const filteredMarkets = markets.filter(
    (m) =>
      m.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cropNameTamil.includes(searchTerm) ||
      m.marketName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Agmarknet Mandi Real-Time Price Feed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('market.title')}</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Track live crop prices across major mandis (Thanjavur, Koyambedu, Pollachi, Guntur, Madurai) with price trends and selling advisories.
        </p>

        {/* Search Input */}
        <div className="relative max-w-md pt-2">
          <Search className="w-5 h-5 absolute left-3.5 top-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop or mandi name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Mandi Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((item) => {
          const isUp = item.trend === 'Up';
          const isDown = item.trend === 'Down';

          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-600/60 shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Crop & Market Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {language === 'ta' ? item.cropNameTamil : item.cropName}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{item.marketName}</span>
                    </div>
                  </div>

                  {/* Trend Badge */}
                  <div
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                      isUp
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : isDown
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isDown ? (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{item.priceChangePercent > 0 ? `+${item.priceChangePercent}%` : `${item.priceChangePercent}%`}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Current Mandi Price</span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono">₹{item.currentPrice}</span>
                    <span className="text-xs text-slate-400 font-medium">/ {item.unit}</span>
                  </div>
                </div>

                {/* Selling Advisory */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-1">Market Advisory:</span>
                  {language === 'ta' ? item.advisoryTamil : item.advisory}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Updated: {item.lastUpdated}</span>
                </span>
                <span className="text-emerald-400 font-semibold">Agmarknet Certified</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Details */}
      <ViewDetailsModal
        title="Agmarknet API Telemetry & Mandi Ticker Feed"
        data={markets}
      />
    </div>
  );
}
