'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, TrendingUp, BarChart2, Clock, ArrowLeft, Info, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

export default function MarketsDirectoryPage() {
  const router = useRouter();
  const { markets, wallet } = useApp();
  const [activeTab, setActiveTab] = useState<'main' | 'starline' | 'jackpot'>('main');

  const filteredMarkets = markets.filter((m) => {
    const isStarline = m.name?.toLowerCase().includes('starline') || m.slug?.toLowerCase().includes('starline');
    const isJackpot = m.name?.toLowerCase().includes('jackpot') || m.slug?.toLowerCase().includes('jackpot');

    if (activeTab === 'starline') return isStarline;
    if (activeTab === 'jackpot') return isJackpot;
    return !isStarline && !isJackpot;
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Live Markets</h1>
            <p className="text-xs text-gray-500 font-medium">Real-time Matka boards & instant betting</p>
          </div>
        </div>

        <Link
          href="/wallet"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-xs"
        >
          <span className="w-4 h-4 rounded-full bg-[#e22e28] text-white flex items-center justify-center text-[10px] font-bold">₹</span>
          <span className="font-black text-xs text-gray-900">
            {wallet ? wallet.totalBalance.toFixed(2) : '0.00'}
          </span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'main', label: 'Main Markets' },
          { key: 'starline', label: 'Starline' },
          { key: 'jackpot', label: 'Jackpot' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              audioHaptics.playTap();
              setActiveTab(tab.key as any);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === tab.key
                ? 'bg-[#e22e28] text-white shadow-md shadow-red-500/20'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Market Cards */}
      <div className="space-y-3 pt-1">
        {filteredMarkets.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center text-gray-500 text-sm font-medium">
            No markets available in this category right now.
          </div>
        ) : (
          filteredMarkets.map((market) => (
            <div
              key={market.id}
              className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs flex flex-col space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-[#e22e28] tracking-wide uppercase">
                    {market.name}
                  </h3>
                  <div className="text-xl font-black text-gray-900 tracking-widest mt-0.5">
                    {market.latestResult?.displayValue || '***-**-***'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/charts/${market.id}/jodi`}
                    className="p-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 active:scale-95"
                    title="View Jodi Chart"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </Link>

                  {market.status === 'OPEN' ? (
                    <Link
                      href={`/markets/${market.slug}/play`}
                      className="bg-[#e22e28] hover:bg-[#c92424] text-white px-5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play
                    </Link>
                  ) : (
                    <span className="bg-gray-100 text-gray-400 px-4 py-2 rounded-full text-xs font-black">
                      Closed
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600">
                <div className="space-y-0.5">
                  <div>Open: <span className="text-gray-900">{market.openTime || '10:00 AM'}</span></div>
                  <div>Close: <span className="text-gray-900">{market.closeTime || '02:00 PM'}</span></div>
                </div>

                <span className={`font-black ${market.status === 'OPEN' ? 'text-green-600' : 'text-[#e22e28]'}`}>
                  {market.status === 'OPEN' ? 'Market Running' : 'Closed for Today'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
