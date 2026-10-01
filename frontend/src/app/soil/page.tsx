'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_SOIL } from '../../data/mockData';
import { SoilData } from '../../types';
import { analyzeSoil } from '../../services/api';
import {
  TestTube2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Sliders,
} from 'lucide-react';
import { ViewDetailsModal } from '../../components/ui/ViewDetailsModal';

export default function SoilPage() {
  const { t, language } = useLanguage();

  const [soil, setSoil] = useState<SoilData>(INITIAL_SOIL);
  const [recommendations, setRecommendations] = useState<string[]>([
    'Apply Zinc Sulfate (10 kg/acre) as soil test indicates Zinc deficiency.',
    'Incorporate 5 tonnes of Farm Yard Manure (FYM) to improve Organic Carbon above 0.75%.',
    'Split Nitrogen top-dressing into 3 equal doses to avoid leaching in clay loam soil.',
  ]);
  const [recommendationsTamil, setRecommendationsTamil] = useState<string[]>([
    'துத்தநாகக் குறைபாட்டைச் போக்க ஏக்கருக்கு 10 கிலோ துத்தநாக சல்பேட் இடவும்.',
    'மண்ணில் கரிமக் சத்தை அதிகரிக்க 5 டன் தொழுவுரம் (FYM) கலந்து நிலத்தை உழவும்.',
    'நைட்ரஜன் மேலுரத்தை 3 சம பங்குகளாக பிரித்து இடவும்.',
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showInputForm, setShowInputForm] = useState(false);

  // Form inputs for custom soil sample testing
  const [phInput, setPhInput] = useState(6.8);
  const [ecInput, setEcInput] = useState(0.42);
  const [ocInput, setOcInput] = useState(0.68);
  const [nInput, setNInput] = useState(210);
  const [pInput, setPInput] = useState(28);
  const [kInput, setKInput] = useState(310);

  const handleRunSoilAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await analyzeSoil({
        ph: phInput,
        ec: ecInput,
        organicCarbon: ocInput,
        nitrogen: { value: nInput, unit: 'kg/ha', status: nInput < 250 ? 'Low' : 'Optimal' as any },
        phosphorus: { value: pInput, unit: 'kg/ha', status: pInput < 20 ? 'Low' : 'Medium' as any },
        potassium: { value: kInput, unit: 'kg/ha', status: kInput > 280 ? 'High' : 'Optimal' as any },
      });

      setTimeout(() => {
        setSoil(res.data);
        setRecommendations(res.recommendations);
        setRecommendationsTamil(res.recommendationsTamil);
        setIsLoading(false);
        setShowInputForm(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <TestTube2 className="w-4 h-4 text-emerald-400" />
            <span>Soil Testing Laboratory Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('soil.title')}</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Real-time soil health report, pH balance, NPK macronutrients, and micronutrient deficiency advisor.
          </p>
        </div>

        <button
          onClick={() => setShowInputForm(!showInputForm)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all shrink-0"
        >
          <Sliders className="w-4 h-4" />
          <span>{showInputForm ? 'Close Form' : 'Test New Soil Sample'}</span>
        </button>
      </div>

      {/* Input Form for New Soil Sample */}
      {showInputForm && (
        <form onSubmit={handleRunSoilAnalysis} className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500 shadow-2xl space-y-4 animate-scaleUp">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <TestTube2 className="w-5 h-5 text-emerald-400" />
            <span>Enter Soil Sample Values</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
            <div>
              <label className="block text-slate-400 text-xs mb-1">pH Level</label>
              <input
                type="number"
                step="0.1"
                value={phInput}
                onChange={(e) => setPhInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">EC (dS/m)</label>
              <input
                type="number"
                step="0.01"
                value={ecInput}
                onChange={(e) => setEcInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Organic Carbon (%)</label>
              <input
                type="number"
                step="0.01"
                value={ocInput}
                onChange={(e) => setOcInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Nitrogen (kg/ha)</label>
              <input
                type="number"
                value={nInput}
                onChange={(e) => setNInput(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Phosphorus (kg/ha)</label>
              <input
                type="number"
                value={pInput}
                onChange={(e) => setPInput(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Potassium (kg/ha)</label>
              <input
                type="number"
                value={kInput}
                onChange={(e) => setKInput(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Analyze Soil Health</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Soil Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: pH & Physical Parameters */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Soil pH & Chemical Balance</span>
          </h2>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase">Soil pH Value</span>
            <div className="text-4xl font-extrabold text-emerald-400 font-mono">{soil.ph}</div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
              {soil.phStatus} (Optimal for Paddy & Vegetables)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">EC (Salinity)</span>
              <span className="font-extrabold text-white text-base">{soil.ec} <span className="text-[10px] text-slate-500">dS/m</span></span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Organic Carbon</span>
              <span className="font-extrabold text-amber-400 text-base">{soil.organicCarbon}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Primary NPK Nutrients */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 md:col-span-2">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Macronutrients (NPK Rating)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nitrogen */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-400">Nitrogen (N)</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">
                  {soil.nitrogen.status}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-white">{soil.nitrogen.value} <span className="text-xs text-slate-400 font-normal">kg/ha</span></div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* Phosphorus */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-400">Phosphorus (P)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                  {soil.phosphorus.status}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-white">{soil.phosphorus.value} <span className="text-xs text-slate-400 font-normal">kg/ha</span></div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            {/* Potassium */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-400">Potassium (K)</span>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-bold">
                  {soil.potassium.status}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-white">{soil.potassium.value} <span className="text-xs text-slate-400 font-normal">kg/ha</span></div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>

          {/* Micronutrients Status */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400">Micronutrients Status:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Zinc (Zn)</span>
                <span className="font-bold text-rose-400">{soil.micronutrients.zinc}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Iron (Fe)</span>
                <span className="font-bold text-emerald-400">{soil.micronutrients.iron}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Boron (B)</span>
                <span className="font-bold text-emerald-400">{soil.micronutrients.boron}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Manganese</span>
                <span className="font-bold text-emerald-400">{soil.micronutrients.manganese}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-600/60 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>AgriAgent Fertilizer & Soil Amendment Action Plan</span>
        </h3>

        <div className="space-y-2">
          {(language === 'ta' ? recommendationsTamil : recommendations).map((rec, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Details View */}
      <ViewDetailsModal
        title="Soil Health Spectrophotometer Telemetry"
        data={soil}
      />
    </div>
  );
}
