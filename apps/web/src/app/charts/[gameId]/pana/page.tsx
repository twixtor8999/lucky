import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function PanaChartPage({ params }: { params: { gameId: string } }) {
  // Decode the URL param (e.g. "shree-ganesh" to "SHREE GANESH")
  const gameName = decodeURIComponent(params.gameId).replace(/-/g, ' ').toUpperCase();
  
  // Dummy historical data for the pana chart (Weeks x Days)
  // Format: "OpenPatti-OpenAnkCloseAnk-ClosePatti" e.g., "358-62-480"
  const chartData = [
    ["123-68-440", "345-29-450", "223-71-560", "147-24-130", "118-05-140", "235-08-350", "124-74-130"],
    ["346-31-470", "159-54-130", "246-27-250", "128-10-550", "345-23-120", "269-79-180", "145-02-110"],
    ["258-52-110", "357-58-350", "237-25-140", "168-52-110", "129-23-120", "149-41-100", "257-46-150"],
    ["150-64-130", "289-98-350", "125-83-120", "248-46-240", "138-25-230", "268-65-140", "***-**-***"],
    ["***-**-***", "***-**-***", "***-**-***", "***-**-***", "***-**-***", "***-**-***", "***-**-***"],
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200">
        <div className="w-full max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-900 hover:text-[#e42e2a] transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="text-xl font-black italic tracking-tighter text-gray-900">
              <span className="text-white bg-[#e42e2a] px-2 py-0.5 rounded mr-1">L</span> LUCKY777
            </div>
          </div>
          
          {/* Admin badge hint */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-md">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Official Records</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-2 md:px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-[#e42e2a] p-6 text-center">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
              {gameName} PANA CHART
            </h1>
            <p className="text-red-100 font-medium mt-2 text-sm">
              Updated Live • Accurate Historical Records
            </p>
          </div>
          
          <div className="p-4 md:p-6 overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300 text-gray-900">
                  <th className="py-4 px-2 font-black text-sm text-center border-r border-gray-200 w-[14%]">MON</th>
                  <th className="py-4 px-2 font-black text-sm text-center border-r border-gray-200 w-[14%]">TUE</th>
                  <th className="py-4 px-2 font-black text-sm text-center border-r border-gray-200 w-[14%]">WED</th>
                  <th className="py-4 px-2 font-black text-sm text-center border-r border-gray-200 w-[14%]">THU</th>
                  <th className="py-4 px-2 font-black text-sm text-center border-r border-gray-200 w-[14%]">FRI</th>
                  <th className="py-4 px-2 font-black text-sm text-center border-r border-gray-200 w-[14%]">SAT</th>
                  <th className="py-4 px-2 font-black text-sm text-center w-[14%]">SUN</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((week, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-200 hover:bg-red-50 transition-colors">
                    {week.map((dayResult, colIndex) => {
                      const isPending = dayResult === "***-**-***";
                      return (
                        <td key={colIndex} className="py-6 px-1 text-center border-r border-gray-200 last:border-r-0">
                          {isPending ? (
                            <span className="text-gray-300 font-black text-lg tracking-widest">{dayResult}</span>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              {/* Open and Close Patti on top and bottom, Jodi in middle */}
                              <span className="text-xs font-bold text-gray-500 tracking-widest">{dayResult.split('-')[0]}</span>
                              <span className="text-xl font-black text-gray-900">{dayResult.split('-')[1]}</span>
                              <span className="text-xs font-bold text-gray-500 tracking-widest">{dayResult.split('-')[2]}</span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO & Info Block */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">About {gameName} Pana Chart</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4 font-medium">
            Welcome to the official {gameName} Pana chart page on Lucky777. Here you can find the complete historical record of Open Patti, Close Patti, and Jodi results updated instantly. Analyzing this {gameName} chart helps players spot patterns and make informed decisions for future gameplay. 
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-gray-500 text-xs leading-relaxed font-bold">
              SECURITY NOTICE: To ensure 100% integrity and trust, all results published on these charts are strictly inputted and verified through the encrypted Admin Dashboard. No other staff or third party can alter these historical records. Lucky777 ensures the fastest update speed so you never miss a result!
            </p>
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="w-full bg-gray-900 text-white py-6 border-t-4 border-[#e42e2a] text-center text-xs text-gray-400 mt-auto">
        <p className="font-bold tracking-wider">© 2026 LUCKY777. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
