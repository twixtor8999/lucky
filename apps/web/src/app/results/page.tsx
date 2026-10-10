'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, Search, Calendar, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';

export default function ResultsPage() {
  const { results, markets } = useApp();
  const [search, setSearch] = useState('');

  const filtered = results.filter((r) =>
    (r.marketName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-24 space-y-4 bg-[#0a0b0e]">
      <div>
        <h1 className="text-xl font-display font-extrabold text-gray-100 tracking-tight">
          Live Market Results
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Official declared numbers, open/close pattis and jodi charts.
        </p>

        <div className="relative mt-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search result by market..."
            className="w-full bg-surface-card text-gray-100 placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-gold-400 focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      {/* Results Feed */}
      <div className="space-y-3">
        {filtered.map((res) => {
          const matchedMarket = markets.find((m) => m.id === res.marketId);
          return (
            <div
              key={res.id}
              className="glass-card rounded-3xl p-4 border border-surface-border hover:border-gold-500/30 transition-all shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-100">{res.marketName}</h3>
                  <span className="text-[11px] text-gray-400 font-medium">{res.resultDate}</span>
                </div>

                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                  <span>PUBLISHED</span>
                </span>
              </div>

              {/* Matka Result Badge */}
              <div className="bg-surface-elevated rounded-2xl p-4 border border-surface-border flex items-center justify-around text-center shadow-inner">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Open Patti</span>
                  <span className="font-mono text-base font-extrabold text-gold-400 tracking-wider">
                    {res.openPatti || '***'}
                  </span>
                </div>

                <div className="px-4 py-1.5 rounded-xl bg-[#0a0b0e] border border-gold-500/40 shadow-glow-gold">
                  <span className="text-[9px] uppercase font-black text-gold-400 block">Jodi</span>
                  <span className="font-mono text-xl font-black text-white tracking-widest">
                    {res.openAnk || '*'}{res.closeAnk || '*'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Close Patti</span>
                  <span className="font-mono text-base font-extrabold text-gold-400 tracking-wider">
                    {res.closePatti || '***'}
                  </span>
                </div>
              </div>

              {/* Action */}
              {matchedMarket && matchedMarket.status === 'OPEN' && (
                <div className="flex justify-end pt-1">
                  <Link
                    href={`/markets/${matchedMarket.slug}/play`}
                    onClick={() => audioHaptics.playChip()}
                    className="gold-gradient-btn px-4 py-1.5 rounded-xl text-xs font-black shadow-glow-gold flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>PLAY NEXT ROUND</span>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
