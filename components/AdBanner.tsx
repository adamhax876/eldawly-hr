'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slotId?: string;
  className?: string;
}

export default function AdBanner({ slotId = 'adsterra-banner', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is where the user will inject their actual Adsterra script.
    // For now, we display a beautifully styled placeholder that fits the dark neon design.
    // When they get their Adsterra JS codes, they can easily paste them here:
    /*
    if (adRef.current) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//www.highperformanceformat.com/YOUR_SLOT_ID/invoke.js';
      adRef.current.appendChild(script);
    }
    */
  }, [slotId]);

  return (
    <div
      ref={adRef}
      id={slotId}
      className={`w-full max-w-4xl mx-auto my-6 p-4 rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center min-h-[90px] relative overflow-hidden group transition-all duration-300 hover:border-amber-500/10 ${className}`}
    >
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Advertisement text marker */}
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 z-10 select-none">
        إعلان ممول / Advertisement
      </span>

      {/* Internal interactive placeholder structure */}
      <div className="w-full flex items-center justify-center p-2 rounded-lg border border-dashed border-slate-800 text-slate-600 text-xs md:text-sm text-center z-10 transition-colors group-hover:text-slate-400 group-hover:border-slate-700 select-none">
        مساحة إعلانية نشطة (Adsterra Banner Placeholder)
      </div>
    </div>
  );
}
