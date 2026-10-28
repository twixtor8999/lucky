import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getServerSession } from '../../../lib/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authCookie = cookies().get('admin_auth');
  const sessionUser = await getServerSession();
  
  const isAuthorized = (authCookie && authCookie.value === 'authenticated') || sessionUser?.role === 'ADMIN';

  if (!isAuthorized) {
    redirect('/super-secret-admin');
  }

  // Ensure cookie is set for background server actions
  if (sessionUser?.role === 'ADMIN' && (!authCookie || authCookie.value !== 'authenticated')) {
    cookies().set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar / Navigation will go here later if needed, or we just do top nav */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header with Back to App navigation */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </Link>
            <div className="w-8 h-8 rounded-xl bg-[#e42e2a] flex items-center justify-center shadow-sm ml-1">
              <span className="font-black text-white italic">M</span>
            </div>
            <span className="font-bold text-gray-900 tracking-wide text-xs md:text-sm">SUPER ADMIN</span>
          </div>
          <div>
            <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-full text-[#e42e2a] text-xs font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e42e2a] animate-pulse"></span>
              <span className="hidden sm:inline">Super</span> Admin
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
