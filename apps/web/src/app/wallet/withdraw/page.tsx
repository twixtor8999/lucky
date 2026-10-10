'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ShieldCheck, AlertCircle, Building2, Smartphone } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

export default function WithdrawPage() {
  const router = useRouter();
  const { wallet, requestWithdrawal } = useApp();

  const [amount, setAmount] = useState<string>('500');
  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseInt(amount) || 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount < 500 || parsedAmount > wallet.cashBalance) return;

    const targetRef = method === 'UPI' ? `UPI: ${upiId}` : `A/C: ${bankAcc} (${ifsc})`;
    setLoading(true);
    const res = await requestWithdrawal(parsedAmount, targetRef);
    setLoading(false);

    if (res.success) {
      router.push('/wallet');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      <div className="space-y-5">
        <div className="pt-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Withdraw Funds
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Instant payout directly to your bank account or UPI ID.
          </p>
        </div>

        {/* Balance Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-black text-gray-500 tracking-wider block mb-1">
              Withdrawable Cash Balance
            </span>
            <span className="text-2xl font-black text-green-600">
              ₹{wallet.cashBalance.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100">Min: ₹500</span>
        </div>

        {/* Payout Method Selection */}
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
            <span>UPI ID / VPA</span>
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
            <Building2 className="w-4 h-4 stroke-[2.5]" />
            <span>Bank Account</span>
          </button>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          {/* Amount input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
              Withdrawal Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">
                ₹
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="500"
                className="w-full bg-white text-gray-900 placeholder-gray-400 pl-9 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm tracking-widest"
              />
            </div>
          </div>

          {/* Target inputs */}
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
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  placeholder="Enter 9-18 digit account number"
                  required
                  className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  required
                  className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm uppercase font-mono"
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-800 space-y-1 mt-6">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="uppercase tracking-wider">Payout Status</span>
            </div>
            <p className="font-medium">Automated payouts are currently unavailable. Your withdrawal request will be processed manually and will remain PENDING.</p>
          </div>

          <button
            type="submit"
            disabled={parsedAmount < 500 || parsedAmount > wallet.cashBalance || loading}
            className="w-full bg-[#e42e2a] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-red-700 disabled:opacity-50 text-sm font-black transition-colors uppercase tracking-wider mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5 stroke-[3]" />
                <span>Request Payout of ₹{parsedAmount.toLocaleString()}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
