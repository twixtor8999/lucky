'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  installPwa: () => Promise<void>;
  showIosGuide: boolean;
  setShowIosGuide: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  installPwa: async () => {},
  showIosGuide: false,
  setShowIosGuide: () => {},
});

export const usePwa = () => useContext(PwaContext);

export default function PwaManager({ children }: { children?: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showGenericGuide, setShowGenericGuide] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // 2. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Register Service Worker
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('✅ Mantri777 Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('⚠️ Service Worker registration failed:', err);
          });
      });
    }

    // 4. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      (window as any).__PWA_DEFERRED_PROMPT__ = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('🎉 Mantri777 PWA was installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = async () => {
    // If already installed
    if (isInstalled) {
      alert('Mantri777 is already installed and running on your device!');
      return;
    }

    // Check deferredPrompt first
    const prompt = deferredPrompt || (window as any).__PWA_DEFERRED_PROMPT__;
    if (prompt) {
      prompt.prompt();
      const choiceResult = await prompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        (window as any).__PWA_DEFERRED_PROMPT__ = null;
      }
      return;
    }

    // If on iOS Safari
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    // Fallback: If prompt not ready yet on Android/Desktop
    setShowGenericGuide(true);
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        installPwa,
        showIosGuide,
        setShowIosGuide,
      }}
    >
      {children}

      {/* iOS Install Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-gray-900 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300 relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e22e28] flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-500/20">
                M
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">Install Mantri777 App</h3>
                <p className="text-xs text-gray-500 font-bold">Follow 2 quick steps on iPhone/iPad</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4 stroke-[2.5]" />
                </div>
                <p className="text-xs">
                  1. Tap the <span className="font-black text-gray-900">Share button</span> at the bottom of Safari.
                </p>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4 stroke-[2.5]" />
                </div>
                <p className="text-xs">
                  2. Scroll down and tap <span className="font-black text-gray-900">Add to Home Screen</span>.
                </p>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#e22e28] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <p className="text-xs">
                  3. Tap <span className="font-black text-gray-900">Add</span> in the top-right corner. Done!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-[#e22e28] text-white py-3.5 rounded-xl font-black text-sm tracking-wide shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-95 transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Generic Browser Guide Modal */}
      {showGenericGuide && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-gray-900 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300 relative">
            <button
              onClick={() => setShowGenericGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e22e28] flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-500/20">
                M
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">Install Mantri777 App</h3>
                <p className="text-xs text-gray-500 font-bold">Fast & secure home screen app</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-xs text-gray-700 leading-relaxed font-medium">
              Tap your browser menu (<span className="font-black text-gray-900">⋮</span> three dots at top or bottom) and select <span className="font-black text-[#e22e28]">"Install App"</span> or <span className="font-black text-[#e22e28]">"Add to Home screen"</span>.
            </div>

            <button
              onClick={() => setShowGenericGuide(false)}
              className="w-full bg-[#e22e28] text-white py-3.5 rounded-xl font-black text-sm tracking-wide shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-95 transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
