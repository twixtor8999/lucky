'use client';

import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePwa } from '@/components/pwa/PwaManager';
import { audioHaptics } from '@/lib/audio-haptics';

export default function HomeDownloadHeroButton() {
  const { openInstallModal, isInstalled } = usePwa();

  return (
    <div className="relative z-30 flex justify-center w-full px-4 -mt-8">
      <button
        onClick={() => {
          audioHaptics.playTap();
          openInstallModal();
        }}
        className="w-full max-w-5xl group cursor-pointer block relative transition-all duration-300 hover:scale-[1.01]"
      >
        <div
          className="w-full h-12 md:h-[56px] rounded-[30px] shadow-sm flex items-center justify-center overflow-hidden relative"
          style={{ backgroundColor: '#e23333' }}
        >
          {/* Animated shimmer on hover */}
          <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none" />
          
          <div className="flex items-center gap-2 text-white font-bold text-[16px] md:text-[18px] relative z-10">
            {isInstalled ? (
              <>
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
                <span>App Already Installed</span>
              </>
            ) : (
              <>
                {/* Android / Device Icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.81.24l-1.89 3.26C15.03 8.44 13.57 8.1 12 8.1c-1.57 0-3.03.34-4.48.85L5.63 5.69c-.16-.3-.52-.39-.81-.24-.29.16-.42.54-.26.85l1.84 3.18C3.52 11.23 1.6 14.36 1.13 18H22.87c-.47-3.64-2.39-6.77-5.27-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                </svg>
                <span>Download & Install App</span>
                <Download className="w-4 h-4 md:w-5 md:h-5 ml-1" />
              </>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
