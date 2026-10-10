'use client';
import { AppProvider } from '@/lib/store';
import TopHeader from './TopHeader';
import BottomNavigation from './BottomNavigation';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <TopHeader />
      <main className="flex-1 w-full mx-auto">
        {children}
      </main>
      <BottomNavigation />
    </AppProvider>
  );
}
