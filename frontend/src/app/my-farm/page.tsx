'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_FARM } from '../../data/mockData';
import { FarmData } from '../../types';
import {
  MapPin,
  Maximize2,
  Layers,
  Droplets,
  Calendar,
  Sprout,
  Edit3,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ViewDetailsModal } from '../../components/ui/ViewDetailsModal';

export default function MyFarmPage() {
  const { t } = useLanguage();
  const [farm, setFarm] = useState<FarmData>(INITIAL_FARM);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<FarmData>(INITIAL_FARM);

  const handleSave = () => {
    setFarm(editForm);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Geo-Tagged Farm Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('farm.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your land attributes, soil classification, irrigation infrastructure, and active crop cycles.
          </p>
        </div>

        <button
          onClick={() => {
            setEditForm(farm);
            setIsEditing(!isEditing);
          }}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-md transition-all shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Farm Profile'}</span>
        </button>
      </div>

      {/* Edit Form Modal/Drawer */}
      {isEditing && (
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500 shadow-2xl space-y-4 animate-scaleUp">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-emerald-400" />
            <span>Update Farm Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-slate-400 mb-1">Farmer Name</label>
              <input
                type="text"
                value={editForm.farmerName}
                onChange={(e) => setEditForm({ ...editForm, farmerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Location & GPS</label>
              <input
                type="text"
                value={editForm.farmLocation}
                onChange={(e) => setEditForm({ ...editForm, farmLocation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Farm Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.farmArea}
                onChange={(e) => setEditForm({ ...editForm, farmArea: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Soil Classification</label>
              <input
                type="text"
                value={editForm.soilType}
                onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Irrigation System</label>
              <input
                type="text"
                value={editForm.irrigationType}
                onChange={(e) => setEditForm({ ...editForm, irrigationType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Farm Attribute Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3 text-emerald-400 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Farm Location</span>
          </div>
          <div className="text-base font-bold text-white leading-snug">{farm.farmLocation}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3 text-emerald-400 mb-2">
            <Maximize2 className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Area</span>
          </div>
          <div className="text-2xl font-extrabold text-white">{farm.farmArea} <span className="text-sm font-normal text-slate-400">Acres</span></div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3 text-emerald-400 mb-2">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Soil Type</span>
          </div>
          <div className="text-base font-bold text-white">{farm.soilType}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3 text-emerald-400 mb-2">
            <Droplets className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Irrigation System</span>
          </div>
          <div className="text-base font-bold text-white">{farm.irrigationType}</div>
        </div>
      </div>

      {/* Active Crops Management Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sprout className="w-6 h-6 text-emerald-400" />
              <span>Active Crops ({farm.crops.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Track growth stage, sowing dates, and current crop health status</p>
          </div>

          <Link
            href="/crops"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Crop</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {farm.crops.map((c) => (
            <div key={c.cropId} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-600/70 transition-colors space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{c.cropName}</h3>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                    {c.healthStatus}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sowing Date:</span>
                    <span className="font-mono font-medium">{c.plantingDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Stage:</span>
                    <span className="font-semibold text-emerald-300">{c.currentStage}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Growth Maturity</span>
                    <span className="font-bold text-emerald-400">{c.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 rounded-full"
                      style={{ width: `${c.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                <Link
                  href="/calendar"
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Crop Timeline</span>
                </Link>
                <Link
                  href={`/crops/${c.cropId}`}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <span>Crop Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Details View */}
      <ViewDetailsModal
        title="My Farm Geo-Location & Soil Schema Payload"
        data={{
          farmer: farm.farmerName,
          coordinates: farm.farmLocation,
          totalAreaAcres: farm.farmArea,
          soilClassification: farm.soilType,
          irrigation: farm.irrigationType,
          activeCrops: farm.crops,
        }}
      />
    </div>
  );
}
