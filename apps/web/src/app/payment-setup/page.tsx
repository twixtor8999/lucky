'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Landmark, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { savePaymentDetailsAction } from '@/app/actions/auth';
import { audioHaptics } from '@/lib/audio-haptics';

export default function PaymentSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [upiId, setUpiId] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');

  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = method === 'UPI' 
      ? { upiId }
      : { bankAccountName, bankAccountNumber, bankIfsc, bankName };

    const res = await savePaymentDetailsAction(data);
    setLoading(false);

    if (res.success) {
      audioHaptics.playSuccess();
      router.push('/after-bonus'); // Proceed to welcome flow options
    } else {
      audioHaptics.playError();
      alert(res.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        <div className="pt-2">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm mb-4 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Setup Payment Details
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Where should we send your winnings? Save your details for instant 1-click withdrawals.
          </p>
        </div>

        {/* Method Toggle */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              audioHaptics.playTap();
              setMethod('UPI');
            }}
            className={`flex-1 py-3.5 rounded-xl text-sm font-black border transition-all flex items-center justify-center gap-2 ${
              method === 'UPI'
                ? 'bg-red-50 text-[#e42e2a] border-[#e42e2a] shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <Smartphone className="w-4 h-4 stroke-[2.5]" />
            <span>UPI ID</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioHaptics.playTap();
              setMethod('BANK');
            }}
            className={`flex-1 py-3.5 rounded-xl text-sm font-black border transition-all flex items-center justify-center gap-2 ${
              method === 'BANK'
                ? 'bg-red-50 text-[#e42e2a] border-[#e42e2a] shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <Landmark className="w-4 h-4 stroke-[2.5]" />
            <span>Bank Account</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'UPI' ? (
             <div className="space-y-2">
               <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                 Your UPI ID (e.g. mobile@paytm)
               </label>
               <input
                 type="text"
                 value={upiId}
                 onChange={(e) => setUpiId(e.target.value)}
                 placeholder="e.g. 9876543210@ybl"
                 required
                 className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm"
               />
             </div>
          ) : (
            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                   Account Holder Name
                 </label>
                 <input
                   type="text"
                   value={bankAccountName}
                   onChange={(e) => setBankAccountName(e.target.value)}
                   placeholder="e.g. Rahul Kumar"
                   required
                   className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm"
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                   Bank Account Number
                 </label>
                 <input
                   type="text"
                   value={bankAccountNumber}
                   onChange={(e) => setBankAccountNumber(e.target.value)}
                   placeholder="e.g. 123456789012"
                   required
                   className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm"
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                   IFSC Code
                 </label>
                 <input
                   type="text"
                   value={bankIfsc}
                   onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                   placeholder="e.g. SBIN0001234"
                   required
                   className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm uppercase font-mono"
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                   Bank Name
                 </label>
                 <input
                   type="text"
                   value={bankName}
                   onChange={(e) => setBankName(e.target.value)}
                   placeholder="e.g. State Bank of India"
                   required
                   className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm"
                 />
               </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex gap-2 items-start mt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-tight">Your payment details are encrypted and securely stored for processing your withdrawals and bonuses.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e42e2a] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-red-700 disabled:opacity-50 text-sm font-black transition-colors uppercase tracking-wider mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                <span>Save Payment Details</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
