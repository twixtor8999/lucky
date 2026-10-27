'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs text-gray-600 leading-relaxed font-medium">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-2xl border border-green-200 font-bold">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>Your privacy and transaction anonymity are fully protected by end-to-end encryption.</span>
        </div>

        <h3 className="font-black text-sm text-gray-900 pt-2">1. Information We Collect</h3>
        <p>
          We collect minimal information necessary to deliver gaming services: your verified phone number, session authentication tokens, and transaction records (deposits, bets, and withdrawals).
        </p>

        <h3 className="font-black text-sm text-gray-900 pt-2">2. How Your Data is Protected</h3>
        <p>
          All passwords and MPINs are hashed using irreversible bcrypt encryption. Transactions are recorded in an immutable ledger with atomic state locking to prevent discrepancies.
        </p>

        <h3 className="font-black text-sm text-gray-900 pt-2">3. Zero Third-Party Sharing</h3>
        <p>
          We do not sell, rent, or distribute player details to any third-party marketing companies or advertising networks.
        </p>
      </div>
    </div>
  );
}
