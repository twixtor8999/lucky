'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Play, Sparkles, ShieldCheck } from 'lucide-react';
import { BET_RULES } from '@/lib/store';

export default function GameRatesPage() {
  const router = useRouter();

  const ratesList = [
    { title: 'Single Digit (Ank)', pay: '₹10 ➔ ₹95', odds: '9.5x', desc: 'Pick any single number from 0 to 9' },
    { title: 'Jodi Digit', pay: '₹10 ➔ ₹950', odds: '95x', desc: 'Pick any 2-digit combination from 00 to 99' },
    { title: 'Single Pana (Patti)', pay: '₹10 ➔ ₹1,500', odds: '150x', desc: 'Three unique ascending digits (e.g. 123, 456)' },
    { title: 'Double Pana (Patti)', pay: '₹10 ➔ ₹3,000', odds: '300x', desc: 'Two identical digits and one different (e.g. 112, 445)' },
    { title: 'Triple Pana (Patti)', pay: '₹10 ➔ ₹9,000', odds: '900x', desc: 'Three identical digits (e.g. 111, 777)' },
    { title: 'Half Sangam', pay: '₹10 ➔ ₹14,000', odds: '1,400x', desc: 'One Pana and one Ank combination' },
    { title: 'Full Sangam', pay: '₹10 ➔ ₹1,00,000', odds: '10,000x', desc: 'Open Pana and Close Pana exact match' },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Game Rates</h1>
            <p className="text-xs text-gray-500 font-medium">Industry-highest payout ratios on all markets</p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 to-[#e22e28] text-white p-5 rounded-3xl shadow-md space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-yellow-300">
          <Sparkles className="w-4 h-4" />
          <span>Maximum Returns Guarantee</span>
        </div>
        <h2 className="text-xl font-black tracking-tight">100% Guaranteed Payout Rates</h2>
        <p className="text-xs text-red-100 font-medium">All winning bets are credited to playable wallet instantly.</p>
      </div>

      {/* Rates Cards Grid */}
      <div className="space-y-2.5">
        {ratesList.map((rate, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-0.5 max-w-[65%]">
              <h3 className="font-black text-sm text-gray-900">{rate.title}</h3>
              <p className="text-xs text-gray-500 font-medium">{rate.desc}</p>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-[#e22e28] block">{rate.pay}</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 text-[#e22e28] text-[10px] font-black border border-red-100">
                {rate.odds} Return
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="pt-2">
        <Link
          href="/markets"
          className="w-full bg-[#e22e28] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play Live Markets Now</span>
        </Link>
      </div>
    </div>
  );
}
