'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, ArrowLeft, Trophy, Clock, AlertCircle, Play, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '@/lib/store';
import { BetStatus } from '@zenvora/shared';
import { audioHaptics } from '@/lib/audio-haptics';

export default function BetsHistoryPage() {
  const router = useRouter();
  const { bets, user } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'WON' | 'LOST'>('ALL');

  const filteredBets = bets.filter((b) => {
    if (filter === 'ACTIVE') return b.status === BetStatus.ACTIVE;
    if (filter === 'WON') return b.status === BetStatus.WON;
    if (filter === 'LOST') return b.status === BetStatus.LOST;
    return true;
  });

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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Bets & Slips</h1>
            <p className="text-xs text-gray-500 font-medium">Track active bets and declared outcomes</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'WON', label: 'Won' },
          { key: 'LOST', label: 'Lost' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              audioHaptics.playTap();
              setFilter(tab.key as any);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              filter === tab.key
                ? 'bg-[#e22e28] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bets List */}
      <div className="space-y-3 pt-1">
        {filteredBets.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base">No {filter !== 'ALL' ? filter.toLowerCase() : ''} bets found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Place a bet on Kalyan, Milan, or Starline markets to start winning!
              </p>
            </div>
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 bg-[#e22e28] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md shadow-red-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Explore Live Markets</span>
            </Link>
          </div>
        ) : (
          filteredBets.map((bet) => {
            const isWon = bet.status === BetStatus.WON;
            const isLost = bet.status === BetStatus.LOST;
            const isActive = bet.status === BetStatus.ACTIVE;

            return (
              <div
                key={bet.id}
                className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {bet.referenceNumber || bet.id}
                    </span>
                    <h3 className="text-base font-black text-gray-900 uppercase">
                      {bet.marketName}
                    </h3>
                    <p className="text-xs font-bold text-[#e22e28] mt-0.5">
                      {bet.betTypeName}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                      isWon
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : isLost
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {isWon && <CheckCircle2 className="w-3 h-3" />}
                    {isLost && <XCircle className="w-3 h-3" />}
                    {isActive && <Clock className="w-3 h-3" />}
                    <span>{bet.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Number</span>
                    <span className="text-sm font-black text-gray-900">{bet.selection}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Amount</span>
                    <span className="text-sm font-black text-gray-900">₹{bet.amount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Potential Win</span>
                    <span className="text-sm font-black text-green-700">₹{bet.potentialWin}</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-medium text-right">
                  Placed on {new Date(bet.placedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
