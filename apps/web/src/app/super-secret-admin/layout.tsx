import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-500/30">
      {children}
    </div>
  );
}
