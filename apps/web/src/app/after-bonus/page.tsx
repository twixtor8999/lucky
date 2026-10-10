'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Wallet, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export default function AfterBonusPage() {
  const router = useRouter();

  const handleChoice = (path: string) => {
    audioHaptics.playTap();
    router.push(path);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#0a0b0e] relative min-h-[90vh]">
      {/* Header Celebration */}
      <div className="pt-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center shadow-glow-emerald mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Successfully Credited</span>
        <h1 className="text-2xl font-display font-extrabold text-gray-100 tracking-tight mt-1">
          ₹100 Bonus in Wallet 🎉
        </h1>
        <p className="text-xs text-gray-400 mt-2 max-w-xs">
          Your promotional bonus is ready. What would you like to do next?
        </p>
      </div>

      {/* Choice Cards */}
      <div className="space-y-4 my-6">
        {/* Option 1: Continue Betting */}
        <button
          onClick={() => handleChoice('/markets')}
          className="w-full text-left p-5 rounded-3xl bg-gradient-to-br from-gold-500/20 via-surface-card to-surface-elevated border-2 border-gold-500/50 shadow-glow-gold hover:border-gold-400 active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-100 flex items-center gap-1.5">
                  <span>Continue Betting</span>
                  <span className="text-[10px] bg-gold-400 text-black px-2 py-0.5 rounded-full font-bold uppercase">Popular</span>
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Play Kalyan, Milan & Time Bazar with your bonus now
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gold-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Option 2: Add Money */}
        <button
          onClick={() => handleChoice('/wallet/add-money')}
          className="w-full text-left p-5 rounded-3xl bg-surface-card hover:bg-surface-elevated border border-surface-border active:scale-[0.98] transition-all relative group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-100">Add Money</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Top up via UPI (GPay/PhonePe) for bigger jackpots
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Footer link to home */}
      <div className="flex justify-center pb-6">
        <button
          onClick={() => handleChoice('/home')}
          className="text-xs text-gray-400 hover:text-gold-400 underline underline-offset-4"
        >
          Go directly to Home Dashboard
        </button>
      </div>
    </div>
  );
}
