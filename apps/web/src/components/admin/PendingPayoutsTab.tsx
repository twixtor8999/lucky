'use client';

import React, { useState, useEffect } from 'react';
import { getWinningBetsPendingPayout, processPayout, markBetAsLost } from '@/app/actions/payouts';
import { Check, X, Search, DollarSign, AlertCircle, Clock } from 'lucide-react';

export default function PendingPayoutsTab() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    setLoading(true);
    try {
      const data = await getWinningBetsPendingPayout();
      setWinners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWinners = winners.filter(w => 
    w.userPhone?.includes(searchQuery) || w.marketName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePay = async (betId: string, winAmount: number, userId: string) => {
    if (!confirm(`Are you sure you want to credit ₹${winAmount} to this player's wallet?`)) return;
    setProcessingId(betId);
    
    const res = await processPayout(betId, winAmount, userId);
    if (res.success) {
      loadWinners();
    } else {
      alert(res.error);
    }
    setProcessingId(null);
  };

  const handleReject = async (betId: string) => {
    if (!confirm('Are you sure you want to cancel this winning bet and mark it as LOST? The user will not receive funds.')) return;
    setProcessingId(betId);
    
    const res = await markBetAsLost(betId);
    if (res.success) {
      loadWinners();
    } else {
      alert(res.error);
    }
    setProcessingId(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[#e42e2a]/30 border-t-[#e42e2a] rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Pending Payouts</h2>
          <p className="text-gray-500 text-sm">Review winning bets and manually credit funds to player wallets.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
            placeholder="Search phone or market..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredWinners.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Check className="w-8 h-8 text-green-400 mb-2" />
              <p>No pending payouts! All winners are paid.</p>
            </div>
          ) : (
            filteredWinners.map(winner => (
              <div key={winner.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Player</div>
                    <div className="font-bold text-gray-900">{winner.userPhone || 'Unknown'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Winning Amount</div>
                    <div className="font-black text-green-600 text-xl">₹{winner.winAmount}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Market</span>
                    <span className="font-bold text-gray-900">{winner.marketName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Bet Type</span>
                    <span className="font-bold text-gray-900">{winner.betTypeCode} ({winner.session || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Selection</span>
                    <span className="font-bold text-[#e42e2a]">{winner.selection}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Bet Amount</span>
                    <span className="font-bold text-gray-900">₹{winner.amountMinor} (x{winner.multiplier})</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(winner.placedAt).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={processingId === winner.id}
                      onClick={() => handleReject(winner.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      disabled={processingId === winner.id}
                      onClick={() => handlePay(winner.id, winner.winAmount, winner.userId)}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === winner.id ? '...' : <DollarSign className="w-4 h-4" />}
                      Pay ₹{winner.winAmount}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Market Details</th>
                <th className="px-6 py-4">Bet Details</th>
                <th className="px-6 py-4 text-right">Win Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                        <Check className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="font-bold text-gray-700">Inbox Zero</p>
                      <p className="text-sm">No pending payouts to process.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWinners.map(winner => (
                  <tr key={winner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{winner.userPhone}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{winner.marketName}</div>
                      <div className="text-xs text-gray-500">{new Date(winner.placedAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        <span className="font-bold">{winner.betTypeCode}</span> 
                        {winner.session && <span className="text-gray-500"> ({winner.session})</span>}
                      </div>
                      <div className="text-sm">
                        Selected: <span className="font-bold text-[#e42e2a]">{winner.selection}</span> | 
                        Bet: ₹{winner.amountMinor} (x{winner.multiplier})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-green-600 text-lg">₹{winner.winAmount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={processingId === winner.id}
                          onClick={() => handleReject(winner.id)}
                          className="px-3 py-1.5 text-sm font-bold rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          disabled={processingId === winner.id}
                          onClick={() => handlePay(winner.id, winner.winAmount, winner.userId)}
                          className="px-4 py-1.5 text-sm font-bold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {processingId === winner.id ? 'Processing...' : <><DollarSign className="w-4 h-4" /> Pay Winnings</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
