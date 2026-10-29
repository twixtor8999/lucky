'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowRight, ShieldCheck } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';
import { updateUserNameAction } from '@/app/actions/auth';

export default function SetupProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanFirst) {
      setErrorMsg('Please enter your First Name.');
      audioHaptics.playError();
      return;
    }

    setLoading(true);
    audioHaptics.playTap();

    try {
      const res = await updateUserNameAction(cleanFirst, cleanLast);
      if (res.success) {
        audioHaptics.playSuccess();
        try {
          const stored = localStorage.getItem('mantri777_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.displayName = res.displayName;
            localStorage.setItem('mantri777_user', JSON.stringify(parsed));
          }
        } catch {}
        // Proceed to MPIN screen as requested!
        router.push('/setup-mpin');
      } else {
        setErrorMsg(res.message || 'Failed to update name');
        audioHaptics.playError();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
      audioHaptics.playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gray-50 relative min-h-screen">
      {/* Header */}
      <div className="pt-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm mb-4">
          <User className="w-7 h-7 text-[#e42e2a]" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          What is your name?
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xs font-medium">
          Enter your first and last name to set up your profile and proceed to security MPIN setup.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm w-full max-w-md mx-auto space-y-4 my-auto">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              First Name <span className="text-[#e42e2a]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Rahul"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 px-4 py-3.5 rounded-xl border border-gray-300 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 font-bold text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sharma"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 px-4 py-3.5 rounded-xl border border-gray-300 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 font-bold text-base transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!firstName.trim() || loading}
            className="w-full bg-[#e42e2a] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
          >
            <span>{loading ? 'Saving...' : 'Continue to Setup MPIN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="pb-6 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Encrypted Profile Verification</span>
        </div>
      </div>
    </div>
  );
}
