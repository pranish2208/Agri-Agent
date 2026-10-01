'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';
import { INITIAL_CROPS } from '../../../data/mockData';
import { getCropById } from '../../../services/api';
import { CropDetail } from '../../../types';
import { CropImage } from '../../../components/ui/CropImage';
import {
  ArrowLeft,
  Sun,
  Droplets,
  Layers,
  Sprout,
  Activity,
  Bug,
  ShieldAlert,
  Scissors,
  CheckCircle2,
  Calendar,
  Thermometer,
  CloudRain,
  Share2,
} from 'lucide-react';
import { ViewDetailsModal } from '../../../components/ui/ViewDetailsModal';

export default function CropDetailPage({ params }: { params: Promise<{ cropId: string }> }) {
  const resolvedParams = use(params);
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'climate' | 'soil' | 'planting' | 'stages' | 'irrigation' | 'nutrients' | 'pests' | 'harvesting'>('overview');

  const localCrop = INITIAL_CROPS.find((c) => c.id.toLowerCase() === resolvedParams.cropId.toLowerCase()) || INITIAL_CROPS[0];
  const [crop, setCrop] = useState<CropDetail>(localCrop);

  useEffect(() => {
    async function loadCropDetail() {
      try {
        const liveDetail = await getCropById(resolvedParams.cropId);
        if (liveDetail) setCrop(liveDetail);
      } catch (err) {
        console.warn('Failed loading live crop detail:', err);
      }
    }
    loadCropDetail();
  }, [resolvedParams.cropId]);

  const tabs = [
    { id: 'overview', label: 'Basic Info' },
    { id: 'climate', label: 'Climate' },
    { id: 'soil', label: 'Soil' },
    { id: 'planting', label: 'Planting' },
    { id: 'stages', label: 'Growth Stages' },
    { id: 'irrigation', label: 'Irrigation' },
    { id: 'nutrients', label: 'Nutrients' },
    { id: 'pests', label: 'Pests & Diseases' },
    { id: 'harvesting', label: 'Harvesting' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/crops"
          className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crop Library</span>
        </Link>
        <span className="text-xs text-slate-400">Crop Knowledge Base ID: {crop.id}</span>
      </div>

      {/* Hero Crop Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="w-full md:w-1/3 h-56 md:h-auto bg-slate-950 relative">
            <CropImage src={crop.image} alt={crop.name} fallbackSrc="/images/crops/rice.jpg" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-800">
              {crop.category}
            </div>
          </div>

          {/* Details Header */}
          <div className="w-full md:w-2/3 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline space-x-3">
                <h1 className="text-3xl font-extrabold text-white">{crop.name}</h1>
                <span className="text-xl font-bold text-emerald-300 font-sans">{crop.nameTamil}</span>
              </div>
              <div className="text-xs text-slate-400 italic font-mono mt-1">{crop.scientificName}</div>

              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                {language === 'ta' ? crop.summaryTamil : crop.summary}
              </p>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Season</span>
                <span className="font-bold text-white truncate">{crop.season}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Duration</span>
                <span className="font-bold text-emerald-400">{crop.durationDays} Days</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Water Requirement</span>
                <span className="font-bold text-amber-400">{crop.waterRequirement}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>Crop Summary & Overview</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase">Description</span>
                <p className="text-slate-300">{crop.summary}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase">தமிழ் விளக்கம்</span>
                <p className="text-slate-300 font-sans">{crop.summaryTamil}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. CLIMATE */}
        {activeTab === 'climate' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>Climate Requirements</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>Temperature</span>
                </span>
                <div className="text-lg font-bold text-white">{crop.climate.temperature}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  <span>Rainfall</span>
                </span>
                <div className="text-lg font-bold text-white">{crop.climate.rainfall}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  <span>Humidity</span>
                </span>
                <div className="text-lg font-bold text-white">{crop.climate.humidity}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Sunlight</span>
                </span>
                <div className="text-lg font-bold text-white">{crop.climate.sunlight}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SOIL */}
        {activeTab === 'soil' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Soil Requirements</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Preferred Soil Type</span>
                <div className="text-base font-bold text-white">{crop.soil.type}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Optimal pH Range</span>
                <div className="text-base font-bold text-emerald-400">{crop.soil.phRange}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Drainage Capacity</span>
                <div className="text-base font-bold text-white">{crop.soil.drainage}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Organic Matter</span>
                <div className="text-base font-bold text-white">{crop.soil.organicMatter}</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. PLANTING */}
        {activeTab === 'planting' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>Planting & Sowing Guidelines</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Seed Rate / Acre</span>
                <div className="text-base font-bold text-white">{crop.planting.seedRate}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Plant Spacing</span>
                <div className="text-base font-bold text-emerald-400">{crop.planting.spacing}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Planting Depth</span>
                <div className="text-base font-bold text-white">{crop.planting.depth}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Recommended Method</span>
                <div className="text-base font-bold text-white">{crop.planting.method}</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. GROWTH STAGES */}
        {activeTab === 'stages' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Growth Stages Timeline</span>
            </h2>
            <div className="space-y-4">
              {crop.growthStages.map((stg, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {stg.stage} <span className="text-emerald-400 text-sm font-sans">({stg.stageTamil})</span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-amber-400 w-fit">
                      {stg.days}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{language === 'ta' ? stg.descriptionTamil : stg.description}</p>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase">Key Agricultural Practices:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-200">
                      {(language === 'ta' ? stg.keyPracticesTamil : stg.keyPractices).map((prac, pIdx) => (
                        <li key={pIdx} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{prac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. IRRIGATION */}
        {activeTab === 'irrigation' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span>Irrigation & Water Management</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Method</span>
                <div className="text-base font-bold text-white">{crop.irrigation.method}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Frequency</span>
                <div className="text-base font-bold text-white">{crop.irrigation.frequency}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-amber-400">Water-Critical Growth Stages</span>
                <ul className="space-y-1 text-xs text-slate-200">
                  {crop.irrigation.criticalStages.map((stage, sIdx) => (
                    <li key={sIdx} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{stage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 7. NUTRIENTS */}
        {activeTab === 'nutrients' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Nutrient & Fertilizer Schedule</span>
            </h2>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-xs text-slate-400">Recommended NPK Ratio:</span>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{crop.nutrients.npkRatio}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3">Growth Stage</th>
                    <th className="p-3">Fertilizer Type</th>
                    <th className="p-3">Dosage / Acre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {crop.nutrients.schedule.map((sch, sIdx) => (
                    <tr key={sIdx} className="hover:bg-slate-950/50">
                      <td className="p-3 font-semibold text-emerald-300">{sch.stage}</td>
                      <td className="p-3 font-bold text-white">{sch.fertilizer}</td>
                      <td className="p-3 text-slate-300">{sch.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. PESTS & DISEASES */}
        {activeTab === 'pests' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Bug className="w-5 h-5 text-rose-400" />
              <span>Major Pests & Diseases Management</span>
            </h2>
            <div className="space-y-4">
              {crop.pestsAndDiseases.map((pd, pIdx) => (
                <div key={pIdx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-base font-bold text-white">
                      {pd.name} <span className="text-emerald-300 text-sm font-sans">({pd.nameTamil})</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                      {pd.severity} Severity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-amber-400 block mb-1">Symptoms:</span>
                      <ul className="space-y-1 text-slate-300">
                        {(language === 'ta' ? pd.symptomsTamil : pd.symptoms).map((sym, idx) => (
                          <li key={idx}>• {sym}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1">Prevention:</span>
                      <ul className="space-y-1 text-slate-300">
                        {(language === 'ta' ? pd.preventionTamil : pd.prevention).map((prev, idx) => (
                          <li key={idx}>• {prev}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-rose-400 block mb-1">Chemical / Bio Treatment:</span>
                      <ul className="space-y-1 text-white font-medium">
                        {(language === 'ta' ? pd.treatmentTamil : pd.treatment).map((treat, idx) => (
                          <li key={idx}>• {treat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. HARVESTING */}
        {activeTab === 'harvesting' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              <span>Harvesting & Post-Harvest Handling</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase">Maturity Indicators</span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {crop.harvesting.indicators.map((ind, iIdx) => (
                    <li key={iIdx} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-amber-400 uppercase">Expected Yield / Acre</span>
                <div className="text-2xl font-extrabold text-white">{crop.harvesting.yieldPerAcre}</div>
                <div className="pt-2 text-xs text-slate-400 border-t border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Post-Harvest Practices:</span>
                  <ul className="space-y-1">
                    {crop.harvesting.postHarvest.map((ph, phIdx) => (
                      <li key={phIdx}>• {ph}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Technical Details */}
      <ViewDetailsModal
        title={`Agronomic Telemetry Schema for ${crop.name}`}
        data={crop}
      />
    </div>
  );
}
