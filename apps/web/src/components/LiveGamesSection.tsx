'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { getLiveHomepageData } from '@/app/actions/homepage';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  result: string;
  isSpecial: boolean;
  isOpen: boolean;
}

interface LiveGamesSectionProps {
  initialMainGames: GameItem[];
  initialStarlineGames: GameItem[];
  initialJackpotGames: GameItem[];
}

export default function LiveGamesSection({
  initialMainGames,
  initialStarlineGames,
  initialJackpotGames,
}: LiveGamesSectionProps) {
  const [mainGames, setMainGames] = useState<GameItem[]>(initialMainGames);
  const [starlineGames, setStarlineGames] = useState<GameItem[]>(initialStarlineGames);
  const [jackpotGames, setJackpotGames] = useState<GameItem[]>(initialJackpotGames);

  useEffect(() => {
    // Sync live state every 5 seconds so admin declarations reflect immediately without manual page reload
    const interval = setInterval(async () => {
      try {
        const fresh = await getLiveHomepageData();
        if (fresh) {
          setMainGames(fresh.mainGames);
          setStarlineGames(fresh.starlineGames);
          setJackpotGames(fresh.jackpotGames);
        }
      } catch (err) {
        // silent fallback
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* 8. Best Games For You (Main Markets) */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight">
              Best Games for You
            </h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainGames.map((market) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-gray-300 transition-all duration-200">
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">
                      {market.result}
                    </div>
                  </div>
                  {market.isOpen ? (
                    <Link
                      href={`/markets/${market.slug}/play`}
                      className="bg-[#de302a] hover:bg-[#c92424] transition-all transform active:scale-95 text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Play
                    </Link>
                  ) : (
                    <button disabled className="bg-gray-300 text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 cursor-not-allowed">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Play
                    </button>
                  )}
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="p-3 px-4 flex justify-between">
                  <Link
                    href={`/chart/jodi/${market.slug}`}
                    className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold inline-block"
                  >
                    Jodi Chart
                  </Link>
                  <Link
                    href={`/chart/pana/${market.slug}`}
                    className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold inline-block"
                  >
                    Pana Chart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Starline Games */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight">Starline Games</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starlineGames.map((market) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-gray-300 transition-all duration-200">
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">{market.result}</div>
                  </div>
                  {market.isOpen ? (
                    <Link
                      href={`/markets/${market.slug}/play`}
                      className="bg-[#de302a] hover:bg-[#c92424] transition-all transform active:scale-95 text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Play
                    </Link>
                  ) : (
                    <button disabled className="bg-gray-300 text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 cursor-not-allowed">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Play
                    </button>
                  )}
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="p-3 px-4 flex justify-start">
                  <Link
                    href={`/chart/pana/${market.slug}`}
                    className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold inline-block"
                  >
                    Pana Chart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Jackpot Games */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight">Jackpot Games</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jackpotGames.map((market) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-gray-300 transition-all duration-200">
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">{market.result}</div>
                  </div>
                  {market.isOpen ? (
                    <Link
                      href={`/markets/${market.slug}/play`}
                      className="bg-[#de302a] hover:bg-[#c92424] transition-all transform active:scale-95 text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Play
                    </Link>
                  ) : (
                    <button disabled className="bg-gray-300 text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 cursor-not-allowed">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Play
                    </button>
                  )}
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="p-3 px-4 flex justify-start">
                  <Link
                    href={`/chart/jodi/${market.slug}`}
                    className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold inline-block"
                  >
                    Jodi Chart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
