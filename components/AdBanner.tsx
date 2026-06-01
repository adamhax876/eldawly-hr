'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slotId?: string;
  className?: string;
}

export default function AdBanner({ className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && typeof window !== 'undefined') {
      // Clear any previous elements
      adRef.current.innerHTML = '';

      // 1. Set atOptions in window
      (window as any).atOptions = {
        'key' : 'bd09efb3a99a55b4a24c86c06623913f',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };

      // 2. Create the invoke.js script tag
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://www.highperformanceformat.com/bd09efb3a99a55b4a24c86c06623913f/invoke.js';

      // 3. Append to ref
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full flex flex-col items-center justify-center my-6 ${className}`}>
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 select-none">
        إعلان ممول / Advertisement
      </span>
      <div
        ref={adRef}
        className="w-full max-w-[728px] min-h-[90px] flex items-center justify-center overflow-hidden"
      />
    </div>
  );
}
