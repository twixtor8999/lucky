'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Smartphone, ArrowRight, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

export default function LoginPage() {
  const router = useRouter();
  const { requestOtp, showToast } = useApp();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast('error', 'Invalid Phone', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    const res = await requestOtp(cleanPhone);
    setLoading(false);

    if (res.success) {
      audioHaptics.playTap();
      router.push(`/login/otp?phone=${cleanPhone}`);
    } else {
      showToast('error', 'Request Failed', res.message || 'Could not send verification code');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gray-50 min-h-screen">
      <div className="pt-10 flex flex-col items-center text-center max-w-sm mx-auto w-full">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-3xl bg-[#e22e28] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-500/20 mb-6">
          M
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Login to Mantri777</h1>
        <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
          Enter your mobile number to access your playable wallet, live markets, and instant withdrawals.
        </p>

        {/* Free ₹100 Welcome Bonus Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#e22e28] text-xs font-bold mt-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Players get ₹100 Free Welcome Bonus</span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 mt-6 shadow-sm w-full text-left space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                Mobile Number
              </label>
              <div className="flex items-center border border-gray-200 rounded-2xl px-3.5 py-3 focus-within:border-[#e22e28] focus-within:ring-2 focus-within:ring-red-500/10 transition-all bg-gray-50/50">
                <span className="font-bold text-gray-500 text-sm mr-2 shrink-0">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent font-bold text-base text-gray-900 outline-none tracking-wide"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-[#e22e28] hover:bg-[#c92424] disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>256-bit End-to-End SSL Encrypted</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pb-4">
        By continuing, you agree to Mantri777's{' '}
        <Link href="/terms" className="text-gray-600 font-bold hover:underline">Terms</Link> &{' '}
        <Link href="/privacy" className="text-gray-600 font-bold hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
}
