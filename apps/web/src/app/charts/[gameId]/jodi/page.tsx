import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function JodiChartPage({ params }: { params: { gameId: string } }) {
  // Decode the URL param (e.g. "shree-ganesh" to "SHREE GANESH")
  const gameName = decodeURIComponent(params.gameId).replace(/-/g, ' ').toUpperCase();
  
  // Dummy historical data for the jodi chart (Weeks x Days)
  const chartData = [
    ["12", "45", "67", "89", "00", "23", "45"],
    ["34", "56", "78", "90", "12", "34", "56"],
    ["22", "33", "44", "55", "66", "77", "88"],
    ["91", "82", "73", "64", "55", "46", "**"],
    ["**", "**", "**", "**", "**", "**", "**"],
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1b2e] sticky top-0 z-50 shadow-md">
        <div className="w-full max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-[#e42e2a] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-xl font-black italic tracking-tighter text-white">
            <span className="text-[#e42e2a] bg-white px-2 py-0.5 rounded mr-1">L</span> LUCKY777
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-[#e42e2a] p-6 text-center">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
              {gameName} JODI CHART
            </h1>
            <p className="text-red-100 font-medium mt-2 text-sm">
              Updated Live • Accurate Historical Records
            </p>
          </div>
          
          <div className="p-4 md:p-6 overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300 text-[#1a1b2e]">
                  <th className="py-3 px-2 font-bold text-sm text-center border-r border-gray-200">MON</th>
                  <th className="py-3 px-2 font-bold text-sm text-center border-r border-gray-200">TUE</th>
                  <th className="py-3 px-2 font-bold text-sm text-center border-r border-gray-200">WED</th>
                  <th className="py-3 px-2 font-bold text-sm text-center border-r border-gray-200">THU</th>
                  <th className="py-3 px-2 font-bold text-sm text-center border-r border-gray-200">FRI</th>
                  <th className="py-3 px-2 font-bold text-sm text-center border-r border-gray-200">SAT</th>
                  <th className="py-3 px-2 font-bold text-sm text-center">SUN</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((week, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-200 hover:bg-red-50 transition-colors">
                    {week.map((dayResult, colIndex) => (
                      <td key={colIndex} className={`py-4 px-2 text-center text-xl font-black border-r border-gray-200 last:border-r-0 ${
                        dayResult === '**' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {dayResult}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO Block */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3">About {gameName} Jodi Chart</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Welcome to the official {gameName} Jodi chart page on Lucky777. Here you can find the complete historical record of Jodi results updated instantly. Analyzing this {gameName} chart helps players spot patterns and make informed decisions for future gameplay. 
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Please note that all historical data is provided for informational and analytical purposes. Lucky777 ensures the fastest update speed so you never miss a result!
          </p>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="w-full bg-black text-white py-6 border-t-4 border-[#e42e2a] text-center text-xs text-gray-500 mt-auto">
        <p>© 2026 LUCKY777. All Rights Reserved.</p>
      </footer>
    </div>
  );
}