'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_CROPS } from '../../data/mockData';
import { getCrops } from '../../services/api';
import { CropDetail } from '../../types';
import { CropImage } from '../../components/ui/CropImage';
import { BookOpen, Search, ArrowRight, Droplets, Calendar, Filter } from 'lucide-react';

export default function CropLibraryPage() {
  const { t, language } = useLanguage();
  const [crops, setCrops] = useState<CropDetail[]>(INITIAL_CROPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function loadCrops() {
      try {
        const liveCrops = await getCrops();
        if (liveCrops && liveCrops.length > 0) {
          setCrops(liveCrops);
        }
      } catch (err) {
        console.warn('Failed loading live crops:', err);
      }
    }
    loadCrops();
  }, []);

  const categories = ['All', 'Cereal', 'Vegetable', 'Spice', 'Fruit', 'Plantation', 'Cash Crop', 'Oilseed', 'Pulse'];

  const filteredCrops = crops.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.nameTamil || '').includes(searchTerm) ||
      (c.scientificName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ICAR & TNAU Knowledge Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('crops.title')}</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Comprehensive agronomic guides for Indian crops — climate requirements, soil preferences, seed rate, NPK nutrient schedules, pest management, and post-harvest handling.
        </p>

        {/* Search & Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('ui.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCrops.map((crop) => (
          <Link
            key={crop.id}
            href={`/crops/${crop.id}`}
            className="group flex flex-col justify-between rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/70 overflow-hidden shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div>
              {/* Crop Image */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <CropImage
                  src={crop.image}
                  alt={crop.name}
                  fallbackSrc="/images/crops/rice.jpg"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[11px] font-bold border border-emerald-800">
                  {crop.category}
                </div>
              </div>

              {/* Crop Information */}
              <div className="p-5 space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {crop.name}
                    </h3>
                    <span className="text-sm font-bold text-emerald-300 font-sans">
                      {crop.nameTamil}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 italic font-mono mt-0.5">
                    {crop.scientificName}
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {language === 'ta' ? crop.summaryTamil : crop.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{crop.durationDays} Days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Water: {crop.waterRequirement}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>View Full Agronomic Guide</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
