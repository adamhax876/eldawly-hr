'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const loadingPhrases = [
  "بنصحي الإتش آر من النوم...",
  "بنشوف الكوارث اللي إنت كاتبها...",
  "بنجيب ليمون عشان نهدي أعصابنا..."
];

export default function DynamicLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % loadingPhrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Glow Effect Background */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl w-24 h-24 animate-pulse"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="relative text-amber-400 z-10"
        >
          <Loader2 size={56} className="animate-spin" />
        </motion.div>
      </div>

      <div className="h-16 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-lg md:text-xl font-medium text-amber-200 tracking-wide dir-rtl"
          >
            {loadingPhrases[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        اصبر علينا شوية، الصدمة محتاجة تجهيز...
      </p>
    </div>
  );
}
