import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authCookie = cookies().get('admin_auth');
  
  if (!authCookie || authCookie.value !== 'authenticated') {
    redirect('/super-secret-admin');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar / Navigation will go here later if needed, or we just do top nav */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Simple Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 shrink-0 shadow-sm">
          <div className="w-8 h-8 rounded bg-[#e42e2a] flex items-center justify-center mr-3 shadow-sm">
            <span className="font-black text-white">L</span>
          </div>
          <span className="font-bold text-gray-900 tracking-wider">ADMIN DASHBOARD</span>
          <div className="ml-auto">
            <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-full text-[#e42e2a] text-xs font-bold uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e42e2a] animate-pulse"></span>
              Override Active
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
