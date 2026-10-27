'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Terms & Conditions</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs text-gray-600 leading-relaxed font-medium">
        <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-2xl border border-red-200 font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#e22e28]" />
          <span>You must be 18 years or older to register and participate in games on Mantri777.</span>
        </div>

        <h3 className="font-black text-sm text-gray-900 pt-2">1. Eligibility</h3>
        <p>
          Participation is restricted to individuals of legal age (18+) residing in jurisdictions where online gaming is permitted by applicable local laws.
        </p>

        <h3 className="font-black text-sm text-gray-900 pt-2">2. Wagering & Settlements</h3>
        <p>
          All placed bets are final once confirmed. Bets cannot be canceled or modified after the market has reached its scheduled closing time.
        </p>

        <h3 className="font-black text-sm text-gray-900 pt-2">3. Deposits & Withdrawals</h3>
        <p>
          Deposits must include a valid 12-digit UPI transaction reference (UTR). Withdrawals are processed daily between 10:00 AM and 08:00 PM IST to the player's designated UPI ID or verified bank account.
        </p>
      </div>
    </div>
  );
}
