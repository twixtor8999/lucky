'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, QrCode } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';
import { getPublicSettings } from '../../actions/settings';

export default function AddMoneyPage() {
  const router = useRouter();
  const { wallet, addMoney } = useApp();
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [utr, setUtr] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const activeAmount = customAmount ? parseInt(customAmount) || 0 : amount;

  useEffect(() => {
    getPublicSettings().then(res => {
      setSettings(res);
    });
  }, []);

  const handleDeposit = async () => {
    if (activeAmount < 10) return;
    if (!utr || utr.trim() === '') return;
    
    setLoading(true);
    const res = await addMoney(activeAmount, utr);
    setLoading(false);

    if (res.success) {
      router.push('/wallet');
    }
  };

  if (!settings) {
    return <div className="p-4 text-center text-gray-400 min-h-screen bg-gray-50">Loading payment settings...</div>;
  }

  if (!settings.depositEnabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 min-h-screen text-center space-y-4">
        <h2 className="text-xl font-bold text-[#e42e2a]">Deposits Disabled</h2>
        <p className="text-sm text-gray-500 font-medium">We are currently not accepting new deposits. Please try again later.</p>
        <button onClick={() => router.push('/wallet')} className="text-blue-600 font-semibold hover:underline text-sm mt-4">Return to Wallet</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      <div className="space-y-5">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Add Money (Manual UPI)
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Deposit by transferring funds directly to the owner.
          </p>
        </div>

        {/* Current Balance Pill */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between shadow-sm">
          <span className="text-sm text-gray-600 font-bold uppercase tracking-wider">Current Available Cash</span>
          <span className="text-lg font-black text-green-600">
            ₹{wallet.cashBalance.toLocaleString()}
          </span>
        </div>

        {/* Amount Presets */}
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-700 uppercase tracking-wider">Select Amount</label>
          <div className="grid grid-cols-4 gap-2.5">
            {[100, 500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  audioHaptics.playChip();
                  setAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-3.5 rounded-xl text-sm font-black border transition-all ${
                  amount === amt && !customAmount
                    ? 'bg-red-50 text-[#e42e2a] border-[#e42e2a] shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="relative mt-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">₹</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Enter custom amount (min ₹10)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white text-gray-900 placeholder-gray-400 pl-9 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-black text-[#e42e2a] flex items-center gap-2 mb-3 uppercase tracking-wider">
            <QrCode className="w-5 h-5 stroke-[2.5]" /> Pay To
          </h3>
          <div className="text-gray-900 font-bold mb-1 text-lg">{settings.ownerName}</div>
          <div className="text-blue-600 font-black tracking-wide bg-blue-50 px-3 py-1.5 rounded-lg inline-block border border-blue-100">{settings.ownerUpiId}</div>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed font-medium">
            <strong className="text-gray-700">1.</strong> Pay exactly <strong className="text-[#e42e2a]">₹{activeAmount.toLocaleString()}</strong> to the UPI ID above.<br/>
            <strong className="text-gray-700">2.</strong> After payment, enter your 12-digit UTR/Reference number below.<br/>
            <strong className="text-gray-700">3.</strong> Funds will be credited after admin verification.
          </p>
        </div>

        {/* UTR Input */}
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-700 uppercase tracking-wider">Transaction UTR / Reference No.</label>
          <input
            type="text"
            placeholder="e.g. 312345678901"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm font-mono tracking-widest"
          />
        </div>
      </div>

      {/* Action CTA */}
      <div className="space-y-4 pt-6">
        <button
          onClick={handleDeposit}
          disabled={activeAmount < 10 || !utr || loading}
          className="w-full bg-[#e42e2a] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-black transition-colors uppercase tracking-wider"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Deposit Request</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Manual Verification Required</span>
        </div>
      </div>
    </div>
  );
}
