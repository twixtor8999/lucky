'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  Smartphone,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';
import { getUserPaymentDetailsAction } from '../../actions/wallet';

export default function WithdrawPage() {
  const router = useRouter();
  const { wallet, requestWithdrawal } = useApp();

  const [amount, setAmount] = useState<string>('500');
  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check IST processing window (10:00 AM - 08:00 PM IST)
  const [isWindowOpen, setIsWindowOpen] = useState(true);

  useEffect(() => {
    const checkWindow = () => {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      const istHour = new Date(utcTime + (5.5 * 60 * 60 * 1000)).getHours();
      setIsWindowOpen(istHour >= 10 && istHour < 20);
    };

    checkWindow();
    const timer = setInterval(checkWindow, 60000);

    // Pre-fill user saved payout info
    getUserPaymentDetailsAction().then(res => {
      if (res.success && res.details) {
        if (res.details.upiId) setUpiId(res.details.upiId);
        if (res.details.bankAccountNumber) setBankAcc(res.details.bankAccountNumber);
        if (res.details.bankIfsc) setIfsc(res.details.bankIfsc);
      }
    });

    return () => clearInterval(timer);
  }, []);

  const parsedAmount = parseInt(amount) || 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (parsedAmount < 500) {
      setErrorMsg('Minimum withdrawal amount is ₹500');
      return;
    }

    if (parsedAmount > wallet.cashBalance) {
      setErrorMsg('Withdrawal amount exceeds your playable cash balance');
      return;
    }

    const targetRef = method === 'UPI' ? `UPI: ${upiId}` : `A/C: ${bankAcc} (${ifsc})`;
    setLoading(true);
    try {
      const res = await requestWithdrawal(parsedAmount, targetRef);
      setLoading(false);

      if (res.success) {
        audioHaptics.playSuccess();
        setSuccessMsg(
          isWindowOpen
            ? 'Withdrawal request submitted! Processing typically takes 30–60 minutes during banking hours.'
            : 'Withdrawal request queued! Payouts are processed daily between 10:00 AM and 08:00 PM IST.'
        );
        setTimeout(() => {
          router.push('/wallet');
        }, 2200);
      } else {
        audioHaptics.playError();
        setErrorMsg(res.message || 'Failed to submit withdrawal request');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      <div className="space-y-5">
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.back()} 
              className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Withdraw Funds
            </h1>
          </div>

          <Link
            href="/wallet/history"
            className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-gray-50"
          >
            History
          </Link>
        </div>

        {/* Withdrawal Operating Window Banner */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWindowOpen 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Processing Window</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isWindowOpen 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isWindowOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {isWindowOpen ? 'Window Active' : 'Queue Mode'}
            </span>
          </div>
          <p className="text-xs font-bold">
            Daily Processing Hours: <span className="underline">10:00 AM – 08:00 PM IST</span>
          </p>
          <p className="text-[11px] text-gray-600 mt-1">
            {isWindowOpen 
              ? 'Requests placed right now are processed within 30–60 minutes directly to your account.'
              : 'You can still submit your request now. It will be queued and cleared when processing resumes at 10:00 AM IST.'}
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
          <span className="text-xs text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
            Min: ₹500
          </span>
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
                Your Receiving UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. 9876543210@paytm"
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

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

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

      <div className="text-center pt-2">
        <span className="text-[11px] text-gray-400 font-bold flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit Encrypted Banking Payouts</span>
        </span>
      </div>
    </div>
  );
}
