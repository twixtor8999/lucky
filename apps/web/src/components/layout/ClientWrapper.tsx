'use client';
import { AppProvider } from '@/lib/store';
import TopHeader from './TopHeader';
import BottomNavigation from './BottomNavigation';
import PwaManager from '@/components/pwa/PwaManager';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <PwaManager>
        <TopHeader />
        <main className="flex-1 w-full mx-auto">
          {children}
        </main>
        <BottomNavigation />
      </PwaManager>
    </AppProvider>
  );
}
