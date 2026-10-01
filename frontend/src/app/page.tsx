'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import {
  INITIAL_FARM,
  INITIAL_WEATHER,
  INITIAL_SOIL,
  INITIAL_MARKETS,
} from '../data/mockData';
import { getWeather, getMarketData, getHealthStatus } from '../services/api';
import {
  CloudSun,
  Sprout,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Bot,
  Zap,
  Activity,
} from 'lucide-react';
import { ViewDetailsModal } from '../components/ui/ViewDetailsModal';

export default function HomePage() {
  const { t, language } = useLanguage();
  const [farm, setFarm] = useState(INITIAL_FARM);
  const [weather, setWeather] = useState(INITIAL_WEATHER);
  const [soil, setSoil] = useState(INITIAL_SOIL);
  const [markets, setMarkets] = useState(INITIAL_MARKETS);
  const [backendHealth, setBackendHealth] = useState<any>(null);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [wData, mData, hData] = await Promise.all([
          getWeather('Thanjavur, Tamil Nadu'),
          getMarketData('Tomato'),
          getHealthStatus(),
        ]);
        if (wData) setWeather(wData);
        if (mData && mData.length > 0) setMarkets(mData);
        if (hData) setBackendHealth(hData);
      } catch (e) {
        console.warn('Backend live sync error:', e);
      }
    }
    loadLiveData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Farmer Greeting & Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-green-950 p-6 sm:p-8 border border-emerald-700/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/80 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>BharatAgentic AI Assistant Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {t('home.greeting')}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              {t('home.subgreeting')}
            </p>
          </div>

          {/* Quick Ask AgriAgent CTA Button */}
          <Link
            href="/ask"
            className="group flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 text-slate-950 font-extrabold text-base shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 select-none shrink-0"
          >
            <Bot className="w-6 h-6 stroke-[2.5]" />
            <span>{t('home.quickAskBtn')}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 2. Today's AI Advice Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/70 border border-amber-500/40 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-300 text-base flex items-center space-x-2">
                <span>{t('home.todayAdviceTitle')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 border border-amber-700/60">High Priority</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Updated 1 hr ago</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {language === 'ta' ? weather.agriculturalAdvisoryTamil : weather.agriculturalAdvisory}
            </p>
            <div className="pt-2 flex items-center space-x-4 text-xs text-emerald-400">
              <Link href="/weather" className="hover:underline flex items-center space-x-1 font-semibold">
                <span>View 7-Day Forecast</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grid Widgets: Weather + Soil + Market */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md hover:border-emerald-700/60 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <CloudSun className="w-4 h-4" />
                <span>Weather</span>
              </span>
              <span className="text-xs text-slate-400">{weather.location}</span>
            </div>
            <div className="flex items-baseline space-x-3 mb-2">
              <span className="text-4xl font-extrabold text-white">{weather.temp}°C</span>
              <span className="text-sm font-medium text-slate-300">
                {language === 'ta' ? weather.conditionTamil : weather.condition}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>Humidity: <span className="font-bold text-white">{weather.humidity}%</span></div>
              <div>Rain Chance: <span className="font-bold text-amber-400">{weather.rainProbability}%</span></div>
              <div>Wind: <span className="font-bold text-white">{weather.windSpeed} km/h</span></div>
              <div>UV Index: <span className="font-bold text-white">{weather.uvIndex}/10</span></div>
            </div>
          </div>
          <Link href="/weather" className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between group">
            <span>Full Weather Analysis</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Soil Status Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md hover:border-emerald-700/60 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4" />
                <span>Soil Status</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-semibold">
                {soil.overallHealth}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">pH Level:</span>
                <span className="font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">{soil.ph} ({soil.phStatus})</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Organic Carbon:</span>
                <span className="font-bold text-white">{soil.organicCarbon}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Nitrogen (N):</span>
                <span className="font-semibold text-amber-400">{soil.nitrogen.value} kg/ha ({soil.nitrogen.status})</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Zinc (Micronutrient):</span>
                <span className="font-semibold text-rose-400">{soil.micronutrients.zinc}</span>
              </div>
            </div>
          </div>
          <Link href="/soil" className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between group">
            <span>Fertilizer & Soil Report</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Market Snapshot Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md hover:border-emerald-700/60 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Market Snapshot</span>
              </span>
              <span className="text-xs text-slate-400">Mandi Live</span>
            </div>
            <div className="space-y-3">
              {markets.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-bold text-white">{language === 'ta' ? item.cropNameTamil : item.cropName}</div>
                    <div className="text-[10px] text-slate-400">{item.marketName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-emerald-400">₹{item.currentPrice}</div>
                    <div className="text-[10px] text-emerald-300 font-semibold">+{item.priceChangePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link href="/market" className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between group">
            <span>View All Market Prices</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 4. My Crops Widget */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Sprout className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">{t('home.myCropsTitle')}</h2>
          </div>
          <Link href="/my-farm" className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1">
            <span>Manage My Farm</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {farm.crops.map((c) => (
            <div key={c.cropId} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-600/60 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">{c.cropName}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-900/70 text-emerald-300 border border-emerald-700/50">
                  {c.healthStatus}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Stage: <span className="text-slate-200 font-medium">{c.currentStage}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Growth Progress</span>
                  <span className="font-bold text-emerald-400">{c.progressPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${c.progressPercentage}%` }} />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Planted: {c.plantingDate}</span>
                <Link href={`/crops/${c.cropId}`} className="text-emerald-400 font-bold hover:underline">
                  Crop Guide &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Details Telemetry Modal */}
      <ViewDetailsModal
        title="Home Dashboard AI Telemetry & API Status"
        data={{
          location: farm.farmLocation,
          cropCount: farm.crops.length,
          soilHealth: soil.overallHealth,
          apiEndpoint: process.env.NEXT_PUBLIC_API_URL || 'Fallback Local API',
          lastSync: new Date().toLocaleTimeString(),
        }}
      />
    </div>
  );
}
