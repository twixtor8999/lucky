'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  ArrowLeft, 
  Star, 
  CheckCircle2, 
  Zap, 
  ExternalLink,
  Info,
  Apple
} from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';
import { usePwa } from '@/components/pwa/PwaManager';

export default function DownloadPage() {
  const { installPwa, isInstalled, isIos, setShowIosGuide } = usePwa();
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect if inside WhatsApp, Instagram, Telegram, or Facebook Webview
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const inApp = /FBAN|FBAV|Instagram|WhatsApp|Telegram|Line|Twitter|Snapchat/i.test(ua);
    setIsInAppBrowser(inApp);
  }, []);

  const openInChrome = () => {
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.host + window.location.pathname + window.location.search;
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 pb-28">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            onClick={() => audioHaptics.playTap()} 
            className="p-1.5 -ml-1.5 text-gray-700 hover:text-black rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black tracking-tight">Download Official App</h1>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> 100% Safe
        </span>
      </header>

      {/* In-App Browser Warning Banner (WhatsApp / Instagram / Telegram) */}
      {isInAppBrowser && (
        <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Open in Chrome for the best 1-tap install experience</span>
          </div>
          <button 
            onClick={openInChrome}
            className="bg-white text-gray-900 px-2.5 py-1 rounded-md text-[11px] font-black shrink-0 shadow hover:bg-gray-100 flex items-center gap-1"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center px-4 pt-6 text-center max-w-md mx-auto w-full">
        {/* App Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#e22e28] to-[#991b1b] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 mb-4 relative">
          <span className="text-white font-black text-4xl italic tracking-tighter drop-shadow-md">M</span>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
            777
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight mb-1 text-gray-900">Mantri777 App</h2>
        <p className="text-gray-500 font-medium text-xs mb-6 max-w-xs">
          Fastest live results, secure deposit & instant withdrawals with zero delay.
        </p>

        {/* PRIMARY OPTION 1: Direct Android APK Download */}
        <div className="w-full bg-white rounded-2xl border-2 border-red-500/30 p-4 shadow-md mb-4 text-left relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#e22e28]">Option 1 • Recommended</span>
                <span className="bg-red-100 text-[#e22e28] text-[10px] font-black px-1.5 py-0.2 rounded">Fastest</span>
              </div>
              <h3 className="font-black text-base text-gray-900 mt-0.5">Android APK Download</h3>
              <p className="text-[11px] text-gray-500 font-medium">Direct installation file for all Android phones</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#e22e28] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>

          <a
            href="/Mantri777.apk"
            download="Mantri777.apk"
            onClick={() => audioHaptics.playTap()}
            className="w-full bg-[#e22e28] hover:bg-red-700 text-white py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-98 transition-all cursor-pointer text-center block"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Android App (4.1 MB)</span>
          </a>

          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-2 px-1">
            <span>Version 2.4.0</span>
            <span>•</span>
            <span className="text-green-600">✓ No Special Permissions</span>
            <span>•</span>
            <span>Android 7.0+</span>
          </div>
        </div>

        {/* SECONDARY OPTION 2: Instant PWA Add to Home Screen */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6 text-left">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-700">Option 2</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded">0 MB Storage</span>
              </div>
              <h3 className="font-black text-base text-gray-900 mt-0.5">Add to Home Screen (PWA)</h3>
              <p className="text-[11px] text-gray-500 font-medium">Instant app experience without downloading a file</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={() => {
              audioHaptics.playTap();
              if (isIos) {
                setShowIosGuide(true);
              } else {
                installPwa();
              }
            }}
            className="w-full bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            {isInstalled ? (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-green-400" />
                <span>PWA Already Installed</span>
              </>
            ) : isIos ? (
              <>
                <Apple className="w-4 h-4 stroke-[2.5]" />
                <span>Install on iPhone / iPad</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 stroke-[2.5] text-amber-400" />
                <span>Install Instant App</span>
              </>
            )}
          </button>
        </div>

        {/* Features list */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3.5 text-left mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs text-gray-900">Zero Lag Gaming</h4>
              <p className="text-[11px] text-gray-500 font-medium">Smoothest betting interface optimized for all smartphones.</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-100"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs text-gray-900">100% Secure & Verified</h4>
              <p className="text-[11px] text-gray-500 font-medium">End-to-end encryption for wallets, bets and instant withdrawals.</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs text-gray-900">₹100 Free Welcome Bonus</h4>
              <p className="text-[11px] text-gray-500 font-medium">Instant ₹100 credit on your first login in the app.</p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Installation Instructions */}
        <div className="w-full text-left bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <h3 className="font-black text-xs text-gray-500 uppercase tracking-wider mb-3">
            How to Install APK (3 Easy Steps)
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs font-semibold text-gray-700">
              <div className="w-5 h-5 rounded-full bg-red-100 text-[#e22e28] flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                1
              </div>
              <p>
                Tap <span className="font-black text-gray-900">"Download Android App"</span> above to download the APK file.
              </p>
            </div>
            <div className="flex items-start gap-3 text-xs font-semibold text-gray-700">
              <div className="w-5 h-5 rounded-full bg-red-100 text-[#e22e28] flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                2
              </div>
              <p>
                Open the file from your notifications and tap <span className="font-black text-gray-900">"Install"</span> (allow "Install from this source" if requested).
              </p>
            </div>
            <div className="flex items-start gap-3 text-xs font-semibold text-gray-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                3
              </div>
              <p>
                Launch <span className="font-black text-gray-900">Mantri777</span> and log in with your mobile number to claim your ₹100 bonus!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
