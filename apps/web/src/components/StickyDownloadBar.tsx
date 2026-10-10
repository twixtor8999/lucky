'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, X } from 'lucide-react';

export default function StickyDownloadBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 400px (below the hero section)
      if (window.scrollY > 400 && !dismissed) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-500 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Gradient backdrop */}
      <div className="w-full bg-gradient-to-t from-black/90 to-black/0 pt-8 pb-4 px-4">
        <div className="max-w-lg mx-auto relative">

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-1 w-7 h-7 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors z-10 border border-gray-600"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Main Download Button */}
          <Link href="/download" className="block group">
            <div
              className="w-full h-[60px] rounded-full flex items-center justify-between px-6 overflow-hidden relative border-2 border-white/20 shadow-[0_0_40px_rgba(228,46,42,0.6)] group-hover:shadow-[0_0_60px_rgba(228,46,42,0.8)] transition-all duration-300 group-hover:scale-[1.02]"
              style={{ background: 'linear-gradient(90deg, #b01a17 0%, #e42e2a 35%, #ff5a5a 65%, #e42e2a 100%)' }}
            >
              {/* Shimmer on hover */}
              <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none" />

              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full group-hover:hidden">
                <div className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
              </div>

              {/* Left: Android icon + text */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.81.24l-1.89 3.26C15.03 8.44 13.57 8.1 12 8.1c-1.57 0-3.03.34-4.48.85L5.63 5.69c-.16-.3-.52-.39-.81-.24-.29.16-.42.54-.26.85l1.84 3.18C3.52 11.23 1.6 14.36 1.13 18H22.87c-.47-3.64-2.39-6.77-5.27-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/70 text-[10px] font-semibold tracking-widest uppercase">Lucky 777</span>
                  <span className="text-white font-black text-[16px] leading-tight tracking-wide group-hover:tracking-wider transition-all duration-300">
                    Download APK Free
                  </span>
                </div>
              </div>

              {/* Right: download arrow */}
              <div className="flex items-center gap-1.5 bg-white/15 group-hover:bg-white/25 rounded-full px-4 py-2 relative z-10 transition-all duration-300 border border-white/20">
                <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform duration-300" />
                <span className="text-white font-black text-sm">GET IT FREE</span>
              </div>
            </div>
          </Link>

          {/* Subtitle */}
          <p className="text-center text-gray-400 text-[11px] mt-2 font-medium tracking-wide">
            🔒 100% Safe & Secure · Android 5.0+ Required
          </p>
        </div>
      </div>
    </div>
  );
}
