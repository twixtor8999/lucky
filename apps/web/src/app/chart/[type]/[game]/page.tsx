import React from 'react';
import Link from 'next/link';
import { getChartData } from '../../../actions/charts';

export default async function ChartPage({ params }: { params: { type: string, game: string } }) {
  const isPana = params.type === 'pana';
  const gameName = params.game.replace(/-/g, ' ').toUpperCase();
  const title = `${gameName} ${isPana ? 'Pana' : 'Jodi'} Chart - ${gameName} ${isPana ? 'Panel' : 'Jodi'} Chart Records`;
  
  // Fetch live chart data from the database
  const chartData = await getChartData(params.game, isPana ? 'pana' : 'jodi');

  return (
    <div className="w-full min-h-screen bg-white font-sans flex flex-col">
      
      {/* Red/Pink Gradient Header */}
      <div className="w-full bg-gradient-to-r from-red-100 via-red-200 to-red-100 py-8 px-4 border-b border-red-200 shadow-sm text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[22px] md:text-[28px] font-black text-gray-900 tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-xs md:text-sm font-medium leading-relaxed max-w-2xl mx-auto">
            {gameName} {isPana ? 'Panel' : 'Jodi'} Chart : Lucky777 provides fastest {gameName} {isPana ? 'Pana' : 'Jodi'} chart records, updated directly from the core market.
          </p>
        </div>
      </div>

      {/* Breadcrumbs / Actions */}
      <div className="w-full max-w-4xl mx-auto px-2 py-4 flex justify-between items-center text-xs font-bold text-gray-500">
        <Link href="/" className="hover:text-red-600 transition-colors">← Back to Home</Link>
        <Link href={`/chart/${params.type}/${params.game}`} className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-full hover:bg-red-100 transition-colors">
          Refresh Chart
        </Link>
      </div>

      {/* The Chart Table */}
      <div className="w-full max-w-4xl mx-auto px-2 pb-16 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 min-w-[700px] text-center bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-50 text-[11px] md:text-[13px] font-black text-gray-800 border-b-2 border-gray-300 uppercase tracking-wider">
              <th className="border-r border-gray-300 p-2 w-[120px]">Date</th>
              <th className="border-r border-gray-300 p-2">Mon</th>
              <th className="border-r border-gray-300 p-2">Tue</th>
              <th className="border-r border-gray-300 p-2">Wed</th>
              <th className="border-r border-gray-300 p-2">Thu</th>
              <th className="border-r border-gray-300 p-2">Fri</th>
              <th className="border-r border-gray-300 p-2">Sat</th>
              <th className="p-2 text-red-600">Sun</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((week, wIdx) => (
              <tr key={wIdx} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                
                {/* Date Range Cell */}
                <td className="border-r border-gray-300 p-2 text-[10px] md:text-[11px] font-bold text-gray-500 whitespace-pre-line leading-tight">
                  {week.dateRange}
                </td>

                {/* Days Cells */}
                {week.days.map((day: any, dIdx: number) => (
                  <td key={dIdx} className="border-r border-gray-300 p-1 md:p-2 align-middle">
                    {!day ? (
                      <div className="text-gray-300 font-black text-lg">***</div>
                    ) : (
                      <div className={`flex flex-col items-center justify-center ${day.highlight ? 'text-red-600' : 'text-gray-900'}`}>
                        {isPana ? (
                          <>
                            <span className="text-[10px] md:text-[11px] font-bold tracking-widest">{day.top}</span>
                            <span className="text-[16px] md:text-[20px] font-black leading-none my-0.5">{day.mid}</span>
                            <span className="text-[10px] md:text-[11px] font-bold tracking-widest">{day.bot}</span>
                          </>
                        ) : (
                          <span className="text-[20px] md:text-[24px] font-black">{day.mid}</span>
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
          <div className="text-center py-10 text-gray-500 font-bold border border-t-0 border-gray-300 bg-gray-50">
            No chart data available for this market yet.
          </div>
        )}
      </div>
    </div>
  );
}
