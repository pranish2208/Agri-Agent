'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_CROPS } from '../../data/mockData';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sprout,
  Sun,
  Scissors,
  ChevronRight,
  Activity,
  Droplets,
  Zap,
} from 'lucide-react';
import { ViewDetailsModal } from '../../components/ui/ViewDetailsModal';

export default function CropCalendarPage() {
  const { t, language } = useLanguage();
  const [selectedCropId, setSelectedCropId] = useState('rice');

  const selectedCrop = INITIAL_CROPS.find((c) => c.id === selectedCropId) || INITIAL_CROPS[0];

  const timelineStages = [
    { key: 'Planting', label: 'Planting & Sowing', labelTamil: 'விதைப்பு & நடுதல்', icon: Sprout, color: 'text-emerald-400', dayRange: 'Days 1 - 25' },
    { key: 'Vegetative', label: 'Vegetative Growth', labelTamil: 'வளர்ச்சிப் பருவம்', icon: Sun, color: 'text-green-400', dayRange: 'Days 26 - 60' },
    { key: 'Flowering', label: 'Flowering Stage', labelTamil: 'பூக்கும் பருவம்', icon: Activity, color: 'text-amber-400', dayRange: 'Days 61 - 90' },
    { key: 'Fruit Development', label: 'Fruit / Grain Filling', labelTamil: 'காய் திரட்சி / பால் பிடித்தல்', icon: Droplets, color: 'text-blue-400', dayRange: 'Days 91 - 110' },
    { key: 'Harvest', label: 'Harvesting & Drying', labelTamil: 'அறுவடை & உலர்த்துதல்', icon: Scissors, color: 'text-purple-400', dayRange: 'Days 111 - 120' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Stage-by-Stage Agronomic Timeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('calendar.title')}</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Visual lifecycle timeline mapping sowing to harvest. Select a crop to view required fertigation, weeding, and disease inspection dates.
        </p>

        {/* Crop Selector Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {INITIAL_CROPS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCropId(c.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedCropId === c.id
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {c.name} ({c.nameTamil})
            </button>
          ))}
        </div>
      </div>

      {/* Visual Timeline Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sprout className="w-6 h-6 text-emerald-400" />
            <span>{selectedCrop.name} Lifecycle Progression</span>
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-300 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
            Total Duration: {selectedCrop.durationDays} Days
          </span>
        </div>

        {/* Timeline Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {timelineStages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative group hover:border-emerald-500/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-slate-900 ${stg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {stg.dayRange}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{stg.label}</h3>
                  <p className="text-xs text-emerald-300 font-sans mt-0.5">{stg.labelTamil}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth Stages Detailed Task Checklist */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Stage-by-Stage Field Action Checklist</span>
        </h2>

        <div className="space-y-4">
          {selectedCrop.growthStages.map((stg, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-white text-base">
                    {stg.stage} <span className="text-emerald-300 text-sm font-sans">({stg.stageTamil})</span>
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 w-fit">
                  {stg.days}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ta' ? stg.descriptionTamil : stg.description}
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Mandatory Field Tasks:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {(language === 'ta' ? stg.keyPracticesTamil : stg.keyPractices).map((prac, pIdx) => (
                    <div key={pIdx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-slate-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{prac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Telemetry */}
      <ViewDetailsModal
        title={`Crop Lifecycle Cron & Timeline Payload for ${selectedCrop.name}`}
        data={selectedCrop.growthStages}
      />
    </div>
  );
}
