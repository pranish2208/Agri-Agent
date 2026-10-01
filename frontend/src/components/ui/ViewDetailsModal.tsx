'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ViewDetailsModalProps {
  title?: string;
  data: Record<string, unknown> | string | unknown;
  defaultOpen?: boolean;
}

export const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  title = 'Technical & Model Debug Details',
  data,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { t } = useLanguage();

  return (
    <div className="mt-4 border border-slate-700/80 bg-slate-900/60 rounded-xl overflow-hidden shadow-inner">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-800/70 hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400 border-b border-slate-700/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <span>{title}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span>{isOpen ? t('ui.hideDetails') : t('ui.viewDetails')}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-2 font-sans text-[11px]">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Developer / Agronomic API telemetry payload</span>
          </div>
          <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-emerald-300 leading-relaxed whitespace-pre-wrap">
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
