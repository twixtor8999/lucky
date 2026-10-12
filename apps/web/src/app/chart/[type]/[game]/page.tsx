import React from 'react';
import Link from 'next/link';
import { getChartData } from '@/app/actions/charts';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { FaqSection } from '@/app/FaqSection';

export default async function ChartPage({ params }: { params: { type: string, game: string } }) {
  const isPana = params.type === 'pana';
  // Cleanly format game name so times like 1030AM become 10:30 AM, 1100AM becomes 11:00 AM, etc.
  const rawName = params.game.replace(/-/g, ' ').toUpperCase();
  const gameName = rawName
    .replace(/(\d{1,2})(\d{2})\s*(AM|PM)/i, '$1:$2 $3')
    .replace(/(\d{1,2}):(\d{2})(AM|PM)/i, '$1:$2 $3');
  const title = `${gameName} ${isPana ? 'Panel' : 'Jodi'} Chart - ${gameName} Chart Records`;
  
  // Fetch live chart data from the database
  const chartData = await getChartData(params.game, isPana ? 'pana' : 'jodi');

  const faqs = [
    {
      q: `What format is the ${gameName} ${isPana ? 'Pana' : 'Jodi'} chart presented in and how is it updated?`,
      a: `The chart is updated in real time directly as results are published. Records are arranged week by week (Monday through Sunday) with the current calendar week displayed at the top.`
    },
    {
      q: `When does the chart calendar cycle to a new week?`,
      a: `The weekly calendar switches automatically right after Sunday completes at midnight (IST), starting a brand new week on Monday.`
    },
    {
      q: `What is the difference between Pana and Jodi charts?`,
      a: `A Jodi chart displays the combined two-digit Jodi numbers (Open Ank + Close Ank), whereas a Pana/Panel chart displays the 3-digit Open Patti, central Jodi, and 3-digit Close Patti.`
    },
    {
      q: `Are the historical records on Mantri777 verified?`,
      a: `Yes, all results and charts published on Mantri777 are verified and encrypted through our admin engine to ensure 100% accuracy and trust.`
    }
  ];

  return (
    <div className="w-full min-h-screen bg-white font-sans flex flex-col text-gray-900">
      
      {/* 1. Header Bar */}
      <header className="w-full bg-[#111] text-white sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-gray-700 mx-1"></div>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <span className="font-black text-white text-base">M</span>
              </div>
              <span className="font-black text-lg italic tracking-tight text-white">MANTRI777</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={isPana ? `/chart/jodi/${params.game}` : `/chart/pana/${params.game}`}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/40 transition-all"
            >
              Switch to {isPana ? 'Jodi' : 'Pana'} Chart
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Red/Pink Gradient Hero Header */}
      <div className="w-full bg-gradient-to-b from-[#ffeded] via-[#fff5f5] to-white py-8 px-4 border-b border-red-100 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-[#e42e2a] text-white text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-3 shadow-sm">
            Live Calendar
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">
            {title}
          </h1>
          <p className="text-gray-600 text-xs md:text-sm font-medium leading-relaxed max-w-2xl mx-auto">
            {gameName} {isPana ? 'Panel' : 'Jodi'} Chart : Mantri777 provides fastest {gameName} {isPana ? 'Pana' : 'Jodi'} chart records, updated directly from the core market.
          </p>
        </div>
      </div>

      {/* 3. The Calendar Table Container */}
      <main className="w-full max-w-4xl mx-auto px-2 md:px-4 py-6 flex-1">
        <div className="overflow-x-auto rounded-xl border border-red-200 shadow-sm bg-white">
          <table className="w-full border-collapse min-w-[720px] text-center bg-white">
            <thead>
              <tr className="bg-[#fff0f0] text-[12px] md:text-[13px] font-black border-b-2 border-red-300 uppercase tracking-wider text-gray-800">
                <th className="border-r border-red-200 p-2.5 w-[110px] text-gray-600">Date</th>
                <th className="border-r border-red-200 p-2.5">Mon</th>
                <th className="border-r border-red-200 p-2.5">Tue</th>
                <th className="border-r border-red-200 p-2.5">Wed</th>
                <th className="border-r border-red-200 p-2.5">Thu</th>
                <th className="border-r border-red-200 p-2.5">Fri</th>
                <th className="border-r border-red-200 p-2.5">Sat</th>
                <th className="p-2.5 text-[#e42e2a]">Sun</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((week, wIdx) => (
                <tr
                  key={wIdx}
                  className={`border-b border-red-100 hover:bg-red-50/60 transition-colors ${
                    wIdx === 0 ? 'bg-amber-50/40' : ''
                  }`}
                >
                  {/* Date Range Cell */}
                  <td className="border-r border-red-200 p-2 text-[10px] md:text-[11px] font-bold text-gray-600 whitespace-pre-line leading-tight bg-[#fafafa]">
                    {week.dateRange}
                    {wIdx === 0 && (
                      <span className="block mt-1 text-[9px] uppercase font-black text-red-600 bg-red-100 px-1 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </td>

                  {/* Day Cells */}
                  {week.days.map((day: any, dIdx: number) => (
                    <td key={dIdx} className="border-r border-red-100 last:border-r-0 p-1.5 md:p-2.5 align-middle">
                      {!day ? (
                        <div className="text-gray-300 font-extrabold text-sm md:text-base select-none">
                          ***
                        </div>
                      ) : (
                        <div className={`flex flex-col items-center justify-center font-black ${day.highlight ? 'text-[#e42e2a]' : 'text-gray-900'}`}>
                          {day.isStarline ? (
                            /* Starline Game: 4 digits (3-digit Patti + 1-digit Ank) */
                            <div className="flex flex-col items-center leading-tight">
                              <span className="text-[11px] md:text-[12px] font-black text-gray-700 tracking-wider">{day.top}</span>
                              <span className="text-[16px] md:text-[20px] font-black my-0.5">{day.bot}</span>
                            </div>
                          ) : isPana ? (
                            /* Standard Pana Game */
                            <>
                              <span className="text-[11px] md:text-[12px] font-bold text-gray-700 tracking-wider">{day.top}</span>
                              <span className="text-[16px] md:text-[20px] font-black leading-none my-0.5">{day.mid}</span>
                              <span className="text-[11px] md:text-[12px] font-bold text-gray-700 tracking-wider">{day.bot}</span>
                            </>
                          ) : (
                            /* Jodi or Jackpot Game (Jackpot has 3 digits, Jodi has 2 digits) */
                            <span className="text-[19px] md:text-[23px] font-black tracking-tight">{day.mid}</span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {chartData.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-bold bg-gray-50">
              No chart data available for this market yet.
            </div>
          )}
        </div>

        {/* 4. SEO Notice Box */}
        <div className="mt-8 border border-red-100 rounded-xl p-5 md:p-6 bg-[#fffaf8] shadow-sm">
          <h2 className="text-[16px] md:text-[18px] font-black text-gray-900 mb-2 uppercase">
            About {gameName} {isPana ? 'Pana' : 'Jodi'} Calendar
          </h2>
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-3">
            Welcome to the official {gameName} {isPana ? 'Pana' : 'Jodi'} calendar on Mantri777. Here you can find the complete historical record of Jodi and Patti results updated in real time. Analyzing these chart patterns helps players formulate strategies and track past market behaviour.
          </p>
          <p className="text-gray-500 text-[11px] md:text-xs">
            * Note: Weekly calendar intervals start every Monday 00:00:00 IST and conclude on Sunday 23:59:59 IST, rolling over automatically each week.
          </p>
        </div>

        {/* 5. FAQs Section */}
        <div className="mt-8 mb-12">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <FaqSection faqs={faqs} />
        </div>
      </main>

      {/* 6. Footer */}
      <footer className="w-full bg-[#0a0a0a] text-white py-8 border-t-4 border-[#e42e2a] text-center text-xs text-gray-400 mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="font-black text-white text-base">M</span>
            </div>
            <span className="font-sans font-black text-xl italic tracking-tighter text-white">MANTRI777</span>
          </div>
          <p className="mt-2 text-gray-500">© 2026 Mantri777. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
