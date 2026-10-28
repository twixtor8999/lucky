'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, X } from 'lucide-react';

import { usePwa } from '@/components/pwa/PwaManager';

export default function StickyDownloadBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { openInstallModal, isInstalled } = usePwa();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling UP and past hero section (400px)
      if (currentScrollY < lastScrollY && currentScrollY > 400 && !dismissed) {
        setVisible(true);
      } 
      // Hide when scrolling DOWN or near the top
      else if (currentScrollY > lastScrollY || currentScrollY <= 400) {
        setVisible(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (dismissed || isInstalled) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-500 ease-out px-4 pb-4 md:pb-6 pointer-events-none ${
        visible ? 'translate-y-0' : 'translate-y-[150%]'
      }`}
    >
      <div className="w-full max-w-5xl mx-auto flex justify-center pointer-events-auto">
        <button
          onClick={() => openInstallModal()}
          className="w-full group cursor-pointer block relative transition-all duration-300 hover:scale-[1.02]"
        >
          <div
            className="w-full h-12 md:h-[56px] rounded-[30px] shadow-lg flex items-center justify-center overflow-hidden relative"
            style={{ backgroundColor: '#e23333' }}
          >
            {/* Animated shimmer on hover */}
            <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none" />

            <div className="flex items-center gap-2 text-white font-bold text-[16px] md:text-[18px] relative z-10">
              {/* Android Icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.81.24l-1.89 3.26C15.03 8.44 13.57 8.1 12 8.1c-1.57 0-3.03.34-4.48.85L5.63 5.69c-.16-.3-.52-.39-.81-.24-.29.16-.42.54-.26.85l1.84 3.18C3.52 11.23 1.6 14.36 1.13 18H22.87c-.47-3.64-2.39-6.77-5.27-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
              </svg>
              <span>Download & Install App</span>
              <Download className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
