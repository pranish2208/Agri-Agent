'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_WEATHER } from '../../data/mockData';
import { getWeather } from '../../services/api';
import {
  CloudSun,
  Thermometer,
  CloudRain,
  Wind,
  Sun,
  Droplets,
  Zap,
  MapPin,
  Calendar,
  AlertTriangle,
  Search,
  RefreshCw,
} from 'lucide-react';
import { ViewDetailsModal } from '../../components/ui/ViewDetailsModal';

export default function WeatherPage() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState(INITIAL_WEATHER);
  const [locationInput, setLocationInput] = useState('Thanjavur, Tamil Nadu');
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeatherData = async (loc: string) => {
    setIsLoading(true);
    try {
      const data = await getWeather(loc);
      if (data) setWeather(data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData('Thanjavur, Tamil Nadu');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      fetchWeatherData(locationInput.trim());
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
          <CloudSun className="w-4 h-4 text-emerald-400" />
          <span>IMD & Open-Meteo Agromet Advisory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('weather.title')}</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Hyper-local weather metrics customized for agricultural activities — rain risk, relative humidity, wind vector for spraying, and crop advisory.
        </p>

        {/* Location Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md pt-1">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Search Village, District or State..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Get Advisory</span>
          </button>
        </form>
      </div>

      {/* Main Weather Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 border border-emerald-700/60 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <MapPin className="w-4 h-4" />
              <span>{weather.location}</span>
            </div>
            <div className="flex items-baseline space-x-4">
              <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">{weather.temp}°C</span>
              <div>
                <div className="text-lg font-bold text-emerald-300">
                  {language === 'ta' ? weather.conditionTamil : weather.condition}
                </div>
                <div className="text-xs text-slate-400">High 33°C / Low 25°C</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <Droplets className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-slate-400 block text-[10px]">Humidity</span>
              <span className="font-extrabold text-white text-sm">{weather.humidity}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <CloudRain className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <span className="text-slate-400 block text-[10px]">Rain Chance</span>
              <span className="font-extrabold text-amber-400 text-sm">{weather.rainProbability}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <Wind className="w-5 h-5 text-slate-300 mx-auto mb-1" />
              <span className="text-slate-400 block text-[10px]">Wind Speed</span>
              <span className="font-extrabold text-white text-sm">{weather.windSpeed} km/h</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <Sun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <span className="text-slate-400 block text-[10px]">UV Index</span>
              <span className="font-extrabold text-white text-sm">{weather.uvIndex} / 10</span>
            </div>
          </div>
        </div>

        {/* Agricultural Interpretation / Advisory */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Agricultural Interpretation & Farmer Action</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {language === 'ta' ? weather.agriculturalAdvisoryTamil : weather.agriculturalAdvisory}
          </p>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span>7-Day Agricultural Weather Forecast</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weather.forecast.map((f, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                idx === 0
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="font-bold text-sm text-white">{language === 'ta' ? f.dayTamil : f.day}</div>
              <CloudSun className="w-6 h-6 text-emerald-400 mx-auto my-1" />
              <div className="text-xs font-bold text-white">
                {f.tempHigh}° <span className="text-slate-400 text-[10px]">/ {f.tempLow}°</span>
              </div>
              <div className="text-[10px] text-amber-400 font-medium">{f.rainProbability}% Rain</div>
              <div className="text-[10px] text-slate-400 truncate">{f.condition}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Telemetry Modal */}
      <ViewDetailsModal
        title="IMD Meteorological Satellite Data Payload"
        data={weather}
      />
    </div>
  );
}
