'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function WelcomePage() {
  const router = useRouter();
  const { claimWelcomeBonus, isBonusClaimed } = useApp();
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ffd700', '#10b981', '#ffffff'],
      });
    } catch {}
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    const res = await claimWelcomeBonus();
    setClaiming(false);
    if (res.success || isBonusClaimed) {
      router.push('/after-bonus');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#0a0b0e] relative min-h-[90vh] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="pt-6 flex flex-col items-center text-center z-10">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 flex items-center justify-center shadow-glow-gold mb-4 animate-bounce">
          <Gift className="w-8 h-8 text-black stroke-[2.5]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Account Activated</span>
        <h1 className="text-3xl font-display font-extrabold text-gray-100 tracking-tight mt-1">
          Welcome to <span className="gold-gradient-text">Lucky 777</span>!
        </h1>
        <p className="text-xs text-gray-400 mt-2 max-w-xs">
          Your account is fully secured. We have a special sign-up reward waiting for you.
        </p>
      </div>

      {/* Bonus Reward Card */}
      <div className="glass-elevated rounded-3xl p-6 border border-gold-500/40 my-6 shadow-2xl relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 bg-gold-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
          Instant Credit
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-gold-300 font-semibold uppercase tracking-wider">Sign-up Welcome Bonus</span>
          <div className="text-5xl font-display font-black text-white mt-2 flex items-baseline gap-1">
            <span className="text-3xl text-gold-400">₹</span>
            <span className="gold-gradient-text">100</span>
          </div>
          <p className="text-xs text-gray-300 mt-2">
            Free promotional chips to wager on all live markets today.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-border/60 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero deposit required to claim</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Usable across Single Ank, Jodi & Patti</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant payouts on winning bets</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="z-10 pb-6">
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full gold-gradient-btn py-4 rounded-2xl flex items-center justify-center gap-2 shadow-glow-gold disabled:opacity-50 text-base font-black transition-all"
        >
          {claiming ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-black" />
              <span>CLAIM ₹100 BONUS</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
