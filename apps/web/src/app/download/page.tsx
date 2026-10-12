'use client';

import React from 'react';
import Link from 'next/link';
import { Download, Smartphone, ShieldCheck, ArrowLeft, Star, ChevronRight } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export default function DownloadPage() {
  return (
    <div className="flex-1 min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-50">
        <Link href="/" onClick={() => audioHaptics.playTap()} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black tracking-tight ml-2">Download App</h1>
      </header>

      <div className="flex-1 flex flex-col items-center px-6 pt-12 text-center max-w-md mx-auto w-full">
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
          <span className="text-white font-black text-5xl italic tracking-tighter">M</span>
        </div>

        <h2 className="text-3xl font-black tracking-tight mb-2">Mantri777 App</h2>
        <p className="text-gray-500 font-medium text-sm mb-8">
          The fastest and most secure way to play. Download the official Android APK now.
        </p>

        {/* Download Button */}
        <button
          onClick={() => {
            audioHaptics.playTap();
            alert('The APK file will be uploaded by the developer soon. Please try again later.');
          }}
          className="w-full bg-[#e42e2a] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all mb-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span className="font-black tracking-wider uppercase text-sm">Download APK v1.0.0</span>
        </button>

        {/* Features list */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 text-left">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm">Mobile Optimized</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">Play seamlessly on any Android device with zero lag.</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-100"></div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm">100% Secure</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">End-to-end encryption for all your bets and withdrawals.</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm">Exclusive App Bonus</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">Get a special ₹100 welcome bonus just for using the app.</p>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="w-full mt-8 text-left">
          <h3 className="font-black text-sm text-gray-400 uppercase tracking-wider mb-3 px-2">How to Install</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <p>Download the APK file</p>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <p>Go to Settings &gt; Security</p>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <p>Enable <span className="font-bold text-gray-900">Unknown Sources</span></p>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">4</div>
              <p>Open the APK and Install</p>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
