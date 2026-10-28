'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Share, PlusSquare, X, CheckCircle2, Download } from 'lucide-react';

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  installPwa: () => Promise<void>;
  downloadApk: () => void;
  showIosGuide: boolean;
  setShowIosGuide: (show: boolean) => void;
  showInstallModal: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  installPwa: async () => {},
  downloadApk: () => {},
  showIosGuide: false,
  setShowIosGuide: () => {},
  showInstallModal: false,
  openInstallModal: () => {},
  closeInstallModal: () => {},
});

export const usePwa = () => useContext(PwaContext);

export default function PwaManager({ children }: { children?: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showGenericGuide, setShowGenericGuide] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const downloadApk = () => {
    try {
      const a = document.createElement('a');
      a.href = '/Mantri777.apk';
      a.download = 'Mantri777.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = '/Mantri777.apk';
    }
  };

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

    // 3. Register Service Worker immediately (both interactive and complete state)
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            console.log('✅ Mantri777 Service Worker registered with scope:', reg.scope);
            reg.update().catch(() => {});
          })
          .catch((err) => {
            console.warn('⚠️ Service Worker registration failed:', err);
          });
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker, { once: true });
      }
    }

    // 4. Capture any existing early prompt from head script
    if ((window as any).__PWA_DEFERRED_PROMPT__) {
      setDeferredPrompt((window as any).__PWA_DEFERRED_PROMPT__);
      setIsInstallable(true);
    }

    // 5. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      (window as any).__PWA_DEFERRED_PROMPT__ = e;
    };

    const handlePromptReady = () => {
      if ((window as any).__PWA_DEFERRED_PROMPT__) {
        setDeferredPrompt((window as any).__PWA_DEFERRED_PROMPT__);
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    // 6. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      (window as any).__PWA_DEFERRED_PROMPT__ = null;
      console.log('🎉 Mantri777 PWA was installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = async () => {
    // If already installed
    if (isInstalled) {
      alert('Mantri777 is already installed and running on your device!');
      return;
    }

    // Check deferredPrompt first or wait briefly if Chrome is still warming up
    let prompt = deferredPrompt || (window as any).__PWA_DEFERRED_PROMPT__;
    if (!prompt) {
      // Give beforeinstallprompt up to 800ms to resolve if user clicked immediately after page load
      prompt = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve(null), 800);
        const onReady = () => {
          clearTimeout(timer);
          window.removeEventListener('pwa-prompt-ready', onReady);
          resolve((window as any).__PWA_DEFERRED_PROMPT__);
        };
        window.addEventListener('pwa-prompt-ready', onReady, { once: true });
      });
    }

    if (prompt) {
      try {
        await prompt.prompt();
        const choiceResult = await prompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          (window as any).__PWA_DEFERRED_PROMPT__ = null;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
      return;
    }

    // If on iOS Safari
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    // Fallback: If prompt not ready yet on Android/Desktop
    // 1. Immediately initiate APK file download
    downloadApk();
    setShowGenericGuide(true);
  };

  // Check URL query param for instant trigger (e.g. redirected from /download)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('install') === 'true') {
        setShowInstallModal(true);
      }
    }
  }, []);

  const openInstallModal = () => {
    if (isInstalled) {
      alert('Mantri777 is already installed and running on your device!');
      return;
    }
    setShowInstallModal(true);
  };

  const closeInstallModal = () => {
    setShowInstallModal(false);
  };

  const handleConfirmInstall = async () => {
    setShowInstallModal(false);
    await installPwa();
  };

  const openInChrome = () => {
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.host + window.location.pathname + window.location.search;
      const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        installPwa,
        downloadApk,
        showIosGuide,
        setShowIosGuide,
        showInstallModal,
        openInstallModal,
        closeInstallModal,
      }}
    >
      {children}

      {/* Install Confirmation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[250] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-gray-900 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative border border-gray-100">
            {/* Top Close Button */}
            <button
              onClick={closeInstallModal}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full active:scale-95 transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Icon & Badge */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl ring-4 ring-amber-100 mb-3 bg-black flex items-center justify-center">
                <img
                  src="/icons/icon-192.png"
                  alt="Mantri777"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Want to install Mantri777 app?
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1.5 px-2">
                Install Mantri777 on your phone for instant 1-tap access, live Satta Matka results, and fast settlements.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-100/80 space-y-1.5 text-[11px] font-bold text-amber-900">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span>Fastest 1-Tap Home Screen Launch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span>Instant Kalyan & Milan Market Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <span>Lightweight (0 MB storage, Zero Battery Drain)</span>
              </div>
            </div>

            {/* Two Action Buttons: Cancel & Install */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={closeInstallModal}
                className="flex-1 py-3 px-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInstall}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#e22e28] hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-center"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Install</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Generic Browser / Mobile Guide Modal */}
      {showGenericGuide && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-gray-900 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 relative">
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
                <h3 className="font-black text-base text-gray-900">Mantri777 App Download</h3>
                <p className="text-xs text-green-700 font-bold">APK Download Started automatically</p>
              </div>
            </div>

            {/* Direct APK Download Button */}
            <div className="pt-1">
              <button
                onClick={downloadApk}
                className="w-full bg-[#e22e28] hover:bg-red-700 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all"
              >
                <span>📥 Re-download APK File (4.1 MB)</span>
              </button>
            </div>

            {/* Quick Action: Open in Google Chrome for WhatsApp/In-App users */}
            <div>
              <button
                onClick={openInChrome}
                className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>🌐 Open in Google Chrome for 1-Tap Install</span>
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5 pt-1 text-xs text-gray-700 font-semibold">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-red-100 text-[#e22e28] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-black text-gray-900">Tap Browser Menu (Top-Right)</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-normal">
                    Tap the <span className="font-black text-gray-900">⋮ (3 dots)</span> at the top right of Chrome or browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-red-100 text-[#e22e28] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-black text-gray-900">Tap "Install App" or "Add to Home Screen"</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-normal">
                    Select <span className="font-black text-[#e22e28]">Install App</span> in the menu list.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-black text-emerald-900">Instant Launch</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5 font-normal">
                    Mantri777 icon appears on your phone screen ready to play with 0 lag.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                onClick={() => {
                  const prompt = (window as any).__PWA_DEFERRED_PROMPT__;
                  if (prompt) {
                    setShowGenericGuide(false);
                    prompt.prompt().catch(() => {});
                  } else {
                    setShowGenericGuide(false);
                  }
                }}
                className="w-full bg-[#e22e28] text-white py-3.5 rounded-xl font-black text-sm tracking-wide shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-95 transition-all"
              >
                Understood — Ready
              </button>
            </div>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
