'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DownloadPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home and trigger install confirmation popup modal directly
    router.replace('/?install=true');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white text-sm font-bold">Redirecting to Mantri777 installation...</p>
      </div>
    </div>
  );
}
