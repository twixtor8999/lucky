'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, RotateCcw, Lock } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '9876543210';
  const { verifyOtp, requestOtp, activeOtpCode } = useApp();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    audioHaptics.playTap();

    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all 4 digits entered
    if (digit && index === 3 && newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (enteredOtp?: string) => {
    const fullOtp = enteredOtp || otp.join('');
    if (fullOtp.length !== 4) return;

    setLoading(true);
    const res = await verifyOtp(phone, fullOtp);
    setLoading(false);

    if (res.success) {
      if (res.requiresMpin || res.isNewUser) {
        router.push('/setup-mpin');
      } else {
        router.push('/home');
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(30);
    await requestOtp(phone);
  };

  const autoFillTestOtp = () => {
    const code = activeOtpCode || '1234';
    const split = code.split('');
    setOtp(split);
    audioHaptics.playTap();
    handleVerify(code);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gray-50 relative min-h-screen">
      <div className="pt-12 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm mb-4">
          <Lock className="w-6 h-6 text-[#e42e2a]" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security Verification</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Enter the 4-digit security code for <br />
          <span className="text-[#e42e2a] font-bold text-base">+91 {phone}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 my-6 shadow-sm w-full max-w-md mx-auto">
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-black bg-gray-50 text-gray-900 rounded-xl border border-gray-300 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          ))}
        </div>

        {/* Live on-screen security verification code pill */}
        <div className="mb-6 flex justify-center">
          <button
            type="button"
            onClick={autoFillTestOtp}
            className="text-[12px] bg-red-50 border border-red-200 text-[#e42e2a] px-4 py-2 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 font-bold shadow-sm"
          >
            <span>⚡ Security Code:</span>
            <span className="font-mono font-black text-base tracking-wider">{activeOtpCode || '••••'}</span>
            <span className="text-[10px] text-gray-500 font-normal">(Tap to Auto-fill)</span>
          </button>
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={otp.some((d) => !d) || loading}
          className="w-full bg-[#e42e2a] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-sm font-bold uppercase tracking-wider">Verify & Proceed</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>

        <div className="mt-5 flex items-center justify-between text-xs font-semibold">
          <span className="text-gray-500">Didn't receive code?</span>
          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className={`flex items-center gap-1 ${
              countdown > 0 ? 'text-gray-400' : 'text-[#e42e2a] hover:text-red-700 transition-colors'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pb-8 w-full max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-gray-500 hover:text-[#e42e2a] transition-colors"
        >
          Change Mobile Number
        </button>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>Secured by SSL Verification</span>
        </div>
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#e42e2a] border-t-transparent rounded-full animate-spin" /></div>}>
      <OtpContent />
    </Suspense>
  );
}
