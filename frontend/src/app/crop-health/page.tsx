'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeCropHealthImage } from '../../services/api';
import { HealthAnalysisResponse } from '../../types';
import {
  Stethoscope,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Activity,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ViewDetailsModal } from '../../components/ui/ViewDetailsModal';

export default function CropHealthPage() {
  const { t, language } = useLanguage();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HealthAnalysisResponse | null>(null);

  // Preset sample disease photos for instant demonstration!
  const samplePresets = [
    {
      name: 'Rice Leaf Blast',
      url: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Tomato Early Blight',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Chilli Leaf Curl',
      url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSelectPreset = (url: string) => {
    setImagePreview(url);
    setSelectedImage(null);
    setResult(null);
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const res = await analyzeCropHealthImage(formData);
      setTimeout(() => {
        setResult(res);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          <span>Computer Vision Diagnostic Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('health.title')}</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Upload leaf or fruit photos to detect pathogens, leaf blight, pest damage, and nutrient chlorosis with instant confidence scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Sample Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <span>Crop Photo Upload</span>
            </h2>

            {/* Image Preview Box */}
            <div className="relative h-64 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Crop Leaf Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 text-slate-500 text-xs space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No image selected yet</p>
                </div>
              )}
            </div>

            {/* File Input */}
            <label className="flex items-center justify-center space-x-2 w-full py-3.5 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl cursor-pointer text-xs font-bold text-slate-300 transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{selectedImage ? selectedImage.name : 'Choose File or Take Photo'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Preset Samples */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Or select sample disease preset:</span>
              <div className="grid grid-cols-3 gap-2">
                {samplePresets.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSelectPreset(preset.url)}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-[11px] text-slate-300 text-center truncate"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Run Analysis Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isLoading || !imagePreview}
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-extrabold text-base shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Scanning Spectral Features...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Diagnose Crop Health</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !isLoading && (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <FileSearch className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Ready for Image Analysis</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Select an image on the left and click "Diagnose Crop Health" to generate instant disease identification, confidence scores, and action steps.
              </p>
            </div>
          )}

          {result && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-600/60 shadow-2xl space-y-6 animate-fadeIn">
              {/* Header result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Diagnosis Result</span>
                  <div className="text-2xl font-extrabold text-white flex items-center space-x-2 mt-0.5">
                    <span>{result.diseaseDetected}</span>
                    <span className="text-emerald-300 text-lg font-sans">({result.diseaseDetectedTamil})</span>
                  </div>
                </div>

                {/* Confidence Badge */}
                <div className="px-4 py-2 rounded-2xl bg-emerald-950 border border-emerald-700 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Confidence Score</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* 1. Possible Issues */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Possible Issues Identified</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {result.possibleIssues.map((iss, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <span>{iss}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 2. Reasoning Factors */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Reasoning Factors</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.reasoningFactors.map((fac, idx) => (
                      <li key={idx}>• {fac}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. Recommended Next Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recommended Next Steps</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <ul className="space-y-2 text-xs text-white">
                    {(language === 'ta' ? result.recommendedStepsTamil : result.recommendedSteps).map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4. What to Monitor */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <Eye className="w-4 h-4" />
                  <span>What to Monitor</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.whatToMonitor.map((mon, idx) => (
                      <li key={idx}>• {mon}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technical Details */}
              <ViewDetailsModal
                title="Computer Vision Spectral Analysis & Model Parameters"
                data={result.technicalDetails}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
