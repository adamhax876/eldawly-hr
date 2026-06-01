'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, Sparkles, Flame, Eye, Users } from 'lucide-react';
import DynamicLoader from '@/components/DynamicLoader';
import ResultsSection from '@/components/ResultsSection';
import AdBanner from '@/components/AdBanner';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roast, setRoast] = useState<string | null>(null);
  const [fix, setFix] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Stats telemetry
  const [stats, setStats] = useState<{ total_visitors: number; total_cvs_roasted: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Telemetry and visitor increment on mount
  useEffect(() => {
    const incrementAndFetchStats = async () => {
      try {
        // Increment visitor count
        await fetch('/api/stats/increment', { method: 'POST' });
        
        // Fetch current statistics
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    
    incrementAndFetchStats();
  }, []);

  // 2. Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== 'application/pdf') {
      setError('عذراً، بنقبل ملفات الـ PDF بس يا غالي!');
      setFile(null);
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('الملف كبير أوي! أقصى مساحة 2 ميجابايت عشان نهدي النفوس.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUploadContainerClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Pop-under Ad Trigger
  const triggerPopunder = () => {
    console.log("Triggering Adsterra Pop-under");
    
    // Simulate Pop-under or trigger native script if configured.
    // If the user has a pop-under, Adsterra injects a script that automatically handles it on first click.
    // We add a window open fallback here as a placeholder for manual pop-unders:
    /*
    const adWindow = window.open('https://www.example.com', '_blank');
    if (adWindow) {
      adWindow.blur();
      window.focus();
    }
    */
  };

  // 4. Send PDF to Backend for Roast & Fix
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Trigger pop-under immediately on user interaction click as requested!
    triggerPopunder();

    setLoading(true);
    setError(null);
    setRoast(null);
    setFix(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'حصلت مشكلة أثناء ترويق الـ CV بتاعك.');
      }

      setRoast(data.roast);
      setFix(data.fix);

      // Refresh stats counter
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setRoast(null);
    setFix(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden relative">
      
      {/* Dynamic background lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

      {/* Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-500/20 shadow-md">
              <Image 
                src="/A_high-end,_minimalist_professional_vector_202606011023.jpeg" 
                alt="الدولي HR Logo" 
                fill
                priority
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                الدولي HR
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">الجلاد الأكبر للسير الذاتية</p>
            </div>
          </div>

          {/* Nav / Stats badges */}
          <div className="flex items-center gap-3">
            {stats && (
              <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-full">
                  <Eye size={12} className="text-amber-400" />
                  <span>زوار: {stats.total_visitors}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-full">
                  <Flame size={12} className="text-orange-500" />
                  <span>كرامات مهدورة: {stats.total_cvs_roasted} 🔥</span>
                </span>
              </div>
            )}
            {/* Hidden admin entry is typed in URL bar directly */}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* Landing Page Content (Visible when no results generated) */}
        <AnimatePresence mode="wait">
          {!roast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center text-center space-y-8"
            >
              {/* Slogan */}
              <div className="space-y-4 max-w-3xl">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mx-auto w-24 h-24 relative rounded-full overflow-hidden border-2 border-amber-400/40 p-1 bg-slate-900 mb-2 shadow-2xl"
                >
                  <Image 
                    src="/A_high-end,_minimalist_professional_vector_202606011023.jpeg" 
                    alt="الدولي HR Center Logo" 
                    fill
                    sizes="96px"
                    className="object-cover rounded-full"
                  />
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-black leading-tight">
                  سيبنا نروقك بالـ <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">AI</span>
                </h2>
                <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto font-medium">
                  ارفع الـ CV بتاعك دلوقتي واحصل على <span className="text-orange-400 font-bold">جلد (Roast)</span> صريح وساخر جداً، مع <span className="text-emerald-400 font-bold">خريطة طريق احترافية (Fix)</span> عشان نظبطلك الكوارث اللي كاتبها!
                </p>
              </div>

              {/* Mobile Stats Counters */}
              {stats && (
                <div className="flex md:hidden items-center justify-center gap-3 text-xs font-semibold py-1">
                  <span className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 py-1.5 px-3 rounded-full">
                    <Eye size={12} className="text-amber-400" />
                    <span>زوار: {stats.total_visitors}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 py-1.5 px-3 rounded-full">
                    <Flame size={12} className="text-orange-500" />
                    <span>كرامات: {stats.total_cvs_roasted} 🔥</span>
                  </span>
                </div>
              )}

              {/* Upload Card */}
              <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* File Input */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                  />

                  {/* Dropzone Container */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadContainerClick}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group min-h-[220px] ${
                      isDragActive 
                        ? 'border-amber-400 bg-amber-500/5' 
                        : file 
                          ? 'border-emerald-500/40 bg-emerald-500/5' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                    }`}
                  >
                    
                    {file ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 w-16 h-16 flex items-center justify-center mx-auto">
                          <FileText size={32} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 truncate max-w-xs mx-auto">{file.name}</p>
                          <p className="text-xs text-slate-400">حجم الملف: {(file.size / 1024 / 1024).toFixed(2)} ميجابايت</p>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 py-1 px-3 rounded-full inline-block">
                          الملف جاهز للفرم! 📄
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-full bg-slate-900 text-slate-400 w-16 h-16 flex items-center justify-center mx-auto transition-colors group-hover:bg-slate-850 group-hover:text-amber-400">
                          <Upload size={32} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">اسحب الـ CV بتاعك هنا أو اضغط للتحميل</p>
                          <p className="text-xs text-slate-400 mt-1">يجب أن يكون الملف بصيغة PDF فقط (الحد الأقصى: 2 ميجابايت)</p>
                        </div>
                      </div>
                    )}

                    {/* Dragging highlight overlay */}
                    <div className="absolute inset-0 rounded-xl bg-amber-500/0 group-hover:bg-amber-500/[0.01] pointer-events-none transition-colors"></div>
                  </div>

                  {/* Errors */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold dir-rtl">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Action Button */}
                  {file && !loading && (
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
                    >
                      <Flame size={20} className="animate-bounce" />
                      <span>ابدا ترويق وتهزيق الـ CV الآن 🔥</span>
                    </motion.button>
                  )}
                  
                  {loading && (
                    <div className="w-full p-6 border border-slate-800 bg-slate-950/40 rounded-xl">
                      <DynamicLoader />
                    </div>
                  )}

                </form>
              </div>

              {/* Adsterra script container placement below the upload section */}
              <AdBanner slotId="adsterra-landing-banner" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Screen */}
        <AnimatePresence>
          {roast && fix && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="font-extrabold text-2xl md:text-3xl text-amber-400 flex items-center justify-center gap-2">
                  <Sparkles className="text-amber-400 animate-spin" size={24} />
                  تم فرم الـ CV بنجاح!
                </h2>
                <p className="text-slate-400 text-sm">تفضل ناتج الجلد والتصليح، وربنا يعوض عليك في كرامتك.</p>
              </div>

              <ResultsSection 
                roast={roast} 
                fix={fix} 
                onReset={handleReset} 
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-800/80 bg-slate-950/40 text-center text-xs text-slate-500 space-y-2 z-10">
        <p>© {new Date().getFullYear()} الدولي HR - جميع الحقوق محفوظة لضمير الإتش آر المستيقظ.</p>
        <p className="text-[10px] text-slate-600">
          تم التطوير بغرض الكوميديا والترفيه. لا نقوم بحفظ ملفات الـ PDF المرفوعة، ولا تخرج عن حدود قراءة النصوص فقط.
        </p>
      </footer>

    </div>
  );
}
