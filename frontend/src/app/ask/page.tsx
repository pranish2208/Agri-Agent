'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { askAgriAgent } from '../../services/api';
import { AskAgriAgentResponse } from '../../types';
import { INITIAL_CROPS } from '../../data/mockData';
import {
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Upload,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CloudSun,
  BrainCircuit,
  ShieldAlert,
  ListOrdered,
  RefreshCw,
  Info,
  ChevronRight,
} from 'lucide-react';
import { ViewDetailsModal } from '../../components/ui/ViewDetailsModal';

export default function AskAgriAgentPage() {
  const { t, language } = useLanguage();

  const [crop, setCrop] = useState('Rice');
  const [location, setLocation] = useState('Thanjavur, Tamil Nadu');
  const [growthStage, setGrowthStage] = useState('Panicle Initiation & Flowering');
  const [symptoms, setSymptoms] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Voice recording state placeholder
  const [isListening, setIsListening] = useState(false);

  // Analysis / Workflow state
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [response, setResponse] = useState<AskAgriAgentResponse | null>(null);

  const stagesOptions = [
    'Nursery & Germination',
    'Vegetative & Tillering',
    'Panicle Initiation & Flowering',
    'Fruit Development & Pod Filling',
    'Maturity & Harvesting',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setSymptoms((prev) => (prev ? `${prev} Leaves turning yellow with brown spindle spots.` : 'Leaves turning yellow with brown spindle spots.'));
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setResponse(null);
    setActiveStep(1);

    // Step by Step Simulated Agent Execution
    const stepTimer1 = setTimeout(() => setActiveStep(2), 700);
    const stepTimer2 = setTimeout(() => setActiveStep(3), 1400);
    const stepTimer3 = setTimeout(() => setActiveStep(4), 2100);
    const stepTimer4 = setTimeout(() => setActiveStep(5), 2800);

    try {
      const res = await askAgriAgent({
        crop,
        location,
        growthStage,
        symptoms,
        image: selectedImage,
      });

      setTimeout(() => {
        setActiveStep(6);
        setResponse(res);
        setIsLoading(false);
      }, 3500);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const workflowSteps = [
    { id: 1, title: 'Input Received', desc: 'Parsing crop, location, growth stage & symptoms.' },
    { id: 2, title: 'Understanding', desc: 'NLP extraction of agronomic indicators & entity tagging.' },
    { id: 3, title: 'Knowledge Retrieval', desc: 'Querying ICAR/TNAU disease vector database.' },
    { id: 4, title: 'Weather Tool', desc: 'Fetching real-time humidity & rain forecast.' },
    { id: 5, title: 'Reasoning & Risk Assessment', desc: 'Evaluating pathogen risk score and dosage formula.' },
    { id: 6, title: 'Action Plan', desc: 'Synthesizing immediate & preventive farming steps.' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Multi-Agent Agronomic Reasoning System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('ask.title')}</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Describe your crop issue, upload leaf images, or use voice input. AgriAgent retrieves weather telemetry, disease DBs, and ICAR practices to output a step-by-step action plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Query Input Form</span>
            </h2>

            {/* Select Crop */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {INITIAL_CROPS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.nameTamil})
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Growth Stage */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Growth Stage</label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {stagesOptions.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* Symptoms Description & Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase">Symptoms & Questions</label>
                
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800'
                  }`}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening (Speak Tamil/English)...' : 'Voice Input'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                required
                placeholder="Describe leaf spots, pest damage, yellowing, or fertilizer doubts..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Optional Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Optional Crop Photo</label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer text-xs text-slate-300 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{selectedImage ? selectedImage.name : 'Upload Leaf Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-emerald-500 shrink-0" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !symptoms.trim()}
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-extrabold text-base shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Agent Working...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Analyze & Generate Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Workflow Steps & Reasoning Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Agent Reasoning Workflow Visualizer */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Agent Workflow Visualization</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {workflowSteps.map((step) => {
                const isDone = activeStep > step.id;
                const isCurrent = activeStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                        : isCurrent
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 animate-pulse shadow-md shadow-amber-950'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold mb-1">
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center shrink-0">
                          {step.id}
                        </span>
                      )}
                      <span className="truncate">{step.title}</span>
                    </div>
                    <p className="text-[10px] leading-tight line-clamp-2 opacity-80">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Output */}
          {response && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-600/60 shadow-2xl space-y-6 animate-fadeIn">
              {/* Risk Assessment Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">AgriAgent Diagnosis & Risk Level</span>
                  <div className="text-lg font-extrabold text-white">{crop} Analysis Result</div>
                </div>
                <div className="px-4 py-2 rounded-xl font-extrabold text-sm bg-rose-950 text-rose-300 border border-rose-800 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>{response.riskAssessment}</span>
                </div>
              </div>

              {/* Step 1: Understanding & Reasoning */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <FileText className="w-4 h-4" />
                  <span>1. Agent Understanding & Agronomic Reasoning</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                  {response.reasoning}
                </div>
              </div>

              {/* Step 2: Weather Factor */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <CloudSun className="w-4 h-4" />
                  <span>2. Weather Tool Correlation</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-amber-300 leading-relaxed">
                  {response.weatherFactor}
                </div>
              </div>

              {/* Step 3: Action Plan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <ListOrdered className="w-4 h-4" />
                  <span>3. Recommended Action Plan</span>
                </h4>

                {/* Immediate Steps */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase">Immediate Action Steps:</span>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {response.actionPlan.immediateSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dosage Advice */}
                {response.actionPlan.dosageAdvice && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs text-amber-200 font-medium">
                    <span className="font-bold">Dosage Formula: </span>
                    {response.actionPlan.dosageAdvice}
                  </div>
                )}
              </div>

              {/* Technical Details View */}
              <ViewDetailsModal
                title="Agent Reasoning Telemetry & Token Payload"
                data={response.technicalDetails}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
