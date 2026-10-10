'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, Delete, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

export default function SetupMpinPage() {
  const router = useRouter();
  const { setupMpin, showToast } = useApp();

  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);

  const activeValue = step === 'create' ? mpin : confirmMpin;

  const handleKeyPress = (digit: string) => {
    if (activeValue.length >= 6) return;
    audioHaptics.playTap();
    const nextVal = activeValue + digit;

    if (step === 'create') {
      setMpin(nextVal);
      if (nextVal.length === 6) {
        setTimeout(() => {
          setStep('confirm');
        }, 200);
      }
    } else {
      setConfirmMpin(nextVal);
      if (nextVal.length === 6) {
        handleFinalSubmit(nextVal);
      }
    }
  };

  const handleDelete = () => {
    audioHaptics.playTap();
    if (step === 'create') {
      setMpin((prev) => prev.slice(0, -1));
    } else {
      setConfirmMpin((prev) => prev.slice(0, -1));
    }
  };

  const handleFinalSubmit = async (finalConfirmVal: string) => {
    if (finalConfirmVal !== mpin) {
      showToast('error', 'MPIN Mismatch', 'Confirmation MPIN does not match. Please try again.');
      setConfirmMpin('');
      setStep('create');
      setMpin('');
      return;
    }

    setLoading(true);
    const res = await setupMpin(mpin);
    setLoading(false);

    if (res.success) {
      router.push('/wallet'); // Go to wallet instead of welcome since the main flow is wallet
    }
  };

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gray-50 relative min-h-screen">
      {/* Header */}
      <div className="pt-12 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm mb-4">
          <KeyRound className="w-6 h-6 text-[#e42e2a]" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {step === 'create' ? 'Set Your 6-Digit MPIN' : 'Confirm Your MPIN'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xs font-medium">
          {step === 'create'
            ? 'Create a secure PIN for instant 1-tap login and transaction approvals.'
            : 'Re-enter the same 6-digit MPIN to verify.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 my-6 shadow-sm w-full max-w-md mx-auto flex flex-col items-center">
        {/* Pin Dots */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const filled = i < activeValue.length;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    filled
                      ? 'bg-[#e42e2a] shadow-md scale-125'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                />
              );
            })}
          </div>

          {step === 'confirm' && (
            <button
              onClick={() => {
                setStep('create');
                setConfirmMpin('');
                setMpin('');
              }}
              className="text-xs font-semibold text-gray-400 hover:text-[#e42e2a] underline mt-6 transition-colors"
            >
              Start over
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 w-full">
            <div className="w-8 h-8 border-4 border-[#e42e2a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-600">Setting up MPIN...</p>
          </div>
        )}

        {/* On-screen Numeric Keypad */}
        {!loading && (
          <div className="w-full max-w-xs mx-auto grid grid-cols-3 gap-3">
            {keypad.map((k, idx) => {
              if (k === '') {
                return <div key={idx} />;
              }

              if (k === 'del') {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={handleDelete}
                    className="h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 active:scale-95 transition-all"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleKeyPress(k)}
                  className="h-16 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-900 active:scale-95 transition-all shadow-sm"
                >
                  {k}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 pb-8 w-full max-w-md mx-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>Secured by Advanced Encryption Standard</span>
        </div>
      </div>
    </div>
  );
}
