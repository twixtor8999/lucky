'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Clock, ArrowLeft, BarChart2, ShieldCheck, ChevronRight, Award } from 'lucide-react';
import { useApp, BET_RULES } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { getMarketBySlug, results, markets } = useApp();

  const market = getMarketBySlug(slug);

  if (markets.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 min-h-screen">
        <div className="w-10 h-10 border-4 border-[#e42e2a] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-gray-600">Loading Market Details...</p>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 min-h-screen">
        <h2 className="text-xl font-bold text-gray-900">Market Not Found</h2>
        <Link href="/markets" className="text-[#e42e2a] font-semibold text-sm mt-3 hover:underline">
          Back to Markets Directory
        </Link>
      </div>
    );
  }

  const isOpen = market.status === 'OPEN';

  // Sample weekly chart history for this market
  const chartHistory = [
    { date: '09 Oct (Today)', openPatti: '358', openAnk: '6', closeAnk: '2', closePatti: '480' },
    { date: '08 Oct', openPatti: '147', openAnk: '2', closeAnk: '8', closePatti: '369' },
    { date: '07 Oct', openPatti: '579', openAnk: '1', closeAnk: '4', closePatti: '257' },
    { date: '06 Oct', openPatti: '246', openAnk: '2', closeAnk: '7', closePatti: '179' },
    { date: '05 Oct', openPatti: '389', openAnk: '0', closeAnk: '5', closePatti: '690' },
  ];

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-24 space-y-5 bg-gray-50 min-h-screen">
      {/* Top Bar / Market Info */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isOpen
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-[#e42e2a] border border-red-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-[#e42e2a]'}`} />
            {isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </span>

          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            Result: {market.resultTime}
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{market.name}</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">{market.description}</p>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
            <span className="text-[10px] uppercase font-black text-gray-500 block mb-1">Open Time</span>
            <span className="text-sm font-black text-gray-900">{market.openTime}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
            <span className="text-[10px] uppercase font-black text-gray-500 block mb-1">Close Time</span>
            <span className="text-sm font-black text-gray-900">{market.closeTime}</span>
          </div>
        </div>
      </div>

      {/* Play CTA Bar */}
      {isOpen && (
        <Link
          href={`/markets/${market.slug}/play`}
          onClick={() => audioHaptics.playChip()}
          className="w-full bg-[#e42e2a] hover:bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md text-sm font-black transition-colors uppercase tracking-wider"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Enter Betting Interface</span>
        </Link>
      )}

      {/* Multiplier / Odds Rules */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-[#e42e2a]" />
          <span>Game Types & Win Multipliers</span>
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.values(BET_RULES).map((rule) => (
            <div
              key={rule.code}
              className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-black text-gray-900 block">{rule.name}</span>
                <span className="text-[10px] font-bold text-gray-500">Min ₹{rule.minAmount}</span>
              </div>
              <span className="text-sm font-black font-mono text-[#e42e2a] bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                {rule.multiplier}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Result Chart */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#e42e2a]" />
            <span>Past Result Chart</span>
          </h2>
          <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md">Panel Record</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                <th className="py-3 pl-1">Date</th>
                <th className="py-3 text-center">Open Patti</th>
                <th className="py-3 text-center">Jodi</th>
                <th className="py-3 text-center pr-1">Close Patti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {chartHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 text-gray-600 font-sans font-bold text-[11px] pl-1">{item.date}</td>
                  <td className="py-3.5 text-center text-gray-900 font-black tracking-widest">{item.openPatti}</td>
                  <td className="py-3.5 text-center">
                    <span className="text-[#e42e2a] font-black bg-red-50 px-2 py-1 rounded border border-red-100">
                      {item.openAnk}{item.closeAnk}
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-gray-900 font-black tracking-widest pr-1">{item.closePatti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
