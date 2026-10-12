'use client';

import React, { useState, useEffect } from 'react';
import MobileAppView from '@/components/mobile/MobileAppView';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  result: string;
  isSpecial: boolean;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface AppAdaptiveRootProps {
  children: React.ReactNode;
  initialMainGames: GameItem[];
  initialStarlineGames: GameItem[];
  initialJackpotGames: GameItem[];
}

export default function AppAdaptiveRoot({
  children,
  initialMainGames,
  initialStarlineGames,
  initialJackpotGames,
}: AppAdaptiveRootProps) {
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const checkStandalone = () => {
      // 1. Standard PWA display mode
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      // 2. iOS home screen web app
      const isIosStandalone = (window.navigator as any).standalone === true;
      // 3. Query param force trigger for testing (e.g. ?app=true)
      const urlParams = new URLSearchParams(window.location.search);
      const isForcedApp = urlParams.get('app') === 'true' || urlParams.get('view') === 'pwa';
      // 4. Capacitor native app runtime
      const isCapacitorNative = !!(window as any).Capacitor?.isNativePlatform?.();

      return isStandaloneMedia || isIosStandalone || isForcedApp || isCapacitorNative;
    };

    setIsStandaloneApp(checkStandalone());

    const mql = window.matchMedia('(display-mode: standalone)');
    const onChange = (e: MediaQueryListEvent) => {
      setIsStandaloneApp(e.matches || checkStandalone());
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // During SSR or before client mount, render standard SEO children
  if (!isMounted || !isStandaloneApp) {
    return <>{children}</>;
  }

  // Standalone installed APK / PWA mode: render the Papa777-style 4-screen native app
  return (
    <MobileAppView
      initialMainGames={initialMainGames}
      initialStarlineGames={initialStarlineGames}
      initialJackpotGames={initialJackpotGames}
    />
  );
}
