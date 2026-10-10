'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Wallet, Award, Clock, ArrowRight, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

export default function HomePage() {
  const { markets, wallet, isBonusClaimed, results } = useApp();

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-24 space-y-5 bg-[#0a0b0e]">
      {/* Promotional Carousel Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900/40 via-surface-card to-amber-950/30 border border-gold-500/30 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1 z-10 max-w-[70%]">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full border border-gold-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              {!isBonusClaimed ? 'New Player Offer' : 'Fastest Payouts'}
            </span>
            <h2 className="text-base font-black text-gray-100 tracking-tight">
              {!isBonusClaimed ? 'Claim ₹100 Free Bonus' : 'Play Kalyan & Milan Live'}
            </h2>
            <p className="text-[11px] text-gray-400">
              Instant 9.5x on Single Ank, 95x on Jodi, 150x on Single Patti.
            </p>
          </div>

          <div className="z-10 shrink-0">
            {!isBonusClaimed ? (
              <Link
                href="/welcome"
                onClick={() => audioHaptics.playTap()}
                className="gold-gradient-btn px-3.5 py-2 rounded-xl text-xs font-bold shadow-glow-gold flex items-center gap-1"
              >
                <span>Claim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/wallet/add-money"
                onClick={() => audioHaptics.playTap()}
                className="gold-gradient-btn px-3 py-2 rounded-xl text-xs font-bold shadow-glow-gold flex items-center gap-1"
              >
                <span>+ Funds</span>
              </Link>
            )}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-4 gap-2.5">
        <Link
          href="/wallet/add-money"
          onClick={() => audioHaptics.playTap()}
          className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center text-center border border-surface-border active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform mb-1.5">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-200">Add Money</span>
        </Link>

        <Link
          href="/markets"
          onClick={() => audioHaptics.playTap()}
          className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center text-center border border-surface-border active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-1.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-200">Markets</span>
        </Link>

        <Link
          href="/results"
          onClick={() => audioHaptics.playTap()}
          className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center text-center border border-surface-border active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-1.5">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-200">Results</span>
        </Link>

        <Link
          href="/bets"
          onClick={() => audioHaptics.playTap()}
          className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center text-center border border-surface-border active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-1.5">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-200">My Bets</span>
        </Link>
      </div>

      {/* Live Markets Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-sm font-extrabold text-gray-100 uppercase tracking-wider">
              Today's Live Markets
            </h2>
          </div>
          <Link
            href="/markets"
            onClick={() => audioHaptics.playTap()}
            className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {markets.slice(0, 4).map((market) => {
            const isOpen = market.status === 'OPEN';
            return (
              <div
                key={market.id}
                className="glass-card rounded-2xl p-3.5 border border-surface-border hover:border-gold-500/30 transition-all shadow-md relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-100">{market.name}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isOpen
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-gray-400">
                    Closes: {market.closeTime}
                  </span>
                </div>

                {/* Result Board */}
                <div className="flex items-center justify-between bg-surface-elevated/70 rounded-xl p-2.5 border border-surface-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Live Result</span>
                    <span className="text-sm font-mono font-black tracking-widest text-gold-300">
                      {market.latestResult ? market.latestResult.displayValue : '***-**-***'}
                    </span>
                  </div>

                  {isOpen ? (
                    <Link
                      href={`/markets/${market.slug}/play`}
                      onClick={() => audioHaptics.playChip()}
                      className="gold-gradient-btn px-4 py-1.5 rounded-xl text-xs font-black shadow-glow-gold flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>PLAY</span>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="bg-surface-card text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-surface-border cursor-not-allowed"
                    >
                      Closed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Published Results Ticker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-100 uppercase tracking-wider">
            Latest Results
          </h2>
          <Link
            href="/results"
            onClick={() => audioHaptics.playTap()}
            className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-0.5"
          >
            <span>Full Chart</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {results.slice(0, 4).map((res) => (
            <div
              key={res.id}
              className="glass-card rounded-2xl p-3 border border-surface-border text-center space-y-1"
            >
              <span className="text-xs font-bold text-gray-200 truncate block">
                {res.marketName}
              </span>
              <div className="bg-surface-elevated py-1.5 px-2 rounded-lg border border-gold-500/20">
                <span className="font-mono text-sm font-black tracking-wider text-gold-300">
                  {res.displayValue}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 block">
                {res.resultDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
