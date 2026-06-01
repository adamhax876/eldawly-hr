'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

interface ResultsSectionProps {
  roast: string;
  fix: string;
  onReset: () => void;
}

export default function ResultsSection({ roast, fix, onReset }: ResultsSectionProps) {
  const [activeTab, setActiveTab] = useState<'roast' | 'fix'>('roast');
  const [copiedRoast, setCopiedRoast] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);

  const copyToClipboard = async (text: string, type: 'roast' | 'fix') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'roast') {
        setCopiedRoast(true);
        setTimeout(() => setCopiedRoast(false), 2000);
      } else {
        setCopiedFix(true);
        setTimeout(() => setCopiedFix(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-8"
    >
      {/* Alert Warning */}
      <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm dir-rtl">
        <AlertTriangle size={20} className="text-amber-400 shrink-0" />
        <p>
          <strong>تنبيه صحي:</strong> الـ Roast مكتوب بغرض الهزار والضحك والجلد الذاتي. لو إنت حساس بلاش تقرأه، ولو كملت خد ليمونة عشان تهدي أعصابك! 🍋
        </p>
      </div>

      {/* Segmented Switcher Tab Control */}
      <div className="flex justify-center">
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1.5 select-none relative shadow-lg shadow-black/40">
          <button
            type="button"
            onClick={() => setActiveTab('roast')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'roast'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
            }`}
          >
            <Flame size={16} className={activeTab === 'roast' ? 'animate-pulse' : ''} />
            <span>🌶️ جلد الـ CV</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('fix')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'fix'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
            }`}
          >
            <CheckCircle size={16} />
            <span>🛠️ خريطة التصليح</span>
          </button>
        </div>
      </div>

      {/* Conditional Cards View */}
      <div className="max-w-3xl mx-auto w-full">
        {activeTab === 'roast' ? (
          <motion.div
            key="roast-tab"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col rounded-2xl border border-red-500/20 bg-slate-900/60 backdrop-blur-md overflow-hidden relative shadow-2xl"
          >
            {/* Top Red Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 to-orange-500"></div>
            
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <Flame size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-red-400">The Roast / الجلد والتهزيق</h3>
                    <p className="text-xs text-slate-400">الإتش آر مستلم كرامتك الأرض</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(roast, 'roast')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-1.5 text-xs border border-slate-700 cursor-pointer self-end sm:self-auto"
                  title="نسخ الترويق"
                >
                  {copiedRoast ? <Check size={14} className="text-red-400" /> : <Copy size={14} />}
                  <span>{copiedRoast ? 'اتنسخ' : 'نسخ'}</span>
                </button>
              </div>

              {/* Roast Body */}
              <div className="flex-1 text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line dir-rtl text-right font-medium">
                {roast}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="fix-tab"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col rounded-2xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-md overflow-hidden relative shadow-2xl"
          >
            {/* Top Green Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500"></div>

            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-emerald-400">The Fix / خريطة التصليح</h3>
                    <p className="text-xs text-slate-400">نصايح المحترفين عشان تتقبل</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(fix, 'fix')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-1.5 text-xs border border-slate-700 cursor-pointer self-end sm:self-auto"
                  title="نسخ خريطة الطريق"
                >
                  {copiedFix ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedFix ? 'اتنسخ' : 'نسخ'}</span>
                </button>
              </div>

              {/* Fix Body */}
              <div className="flex-1 text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line dir-rtl text-right font-medium">
                {fix}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <RotateCcw size={18} />
          <span>ارفع CV تاني وجرب حظك</span>
        </button>
      </div>
    </motion.div>
  );
}
