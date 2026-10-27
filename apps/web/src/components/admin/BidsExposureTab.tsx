'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAdminBidsData } from '@/app/actions/admin';
import { 
  Users, 
  Search, 
  Filter, 
  RotateCw, 
  Layers, 
  TrendingUp, 
  Hash, 
  Coins, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame
} from 'lucide-react';

interface MarketItem {
  id: string;
  name: string;
  slug: string;
  category: 'main' | 'starline' | 'jackpot';
}

interface BetItem {
  id: string;
  userId: string;
  userPhone: string;
  marketId: string;
  marketName: string;
  category: 'main' | 'starline' | 'jackpot';
  betTypeCode: string;
  selection: string;
  session: string;
  amount: number;
  status: string;
  placedAt: string;
}

const BET_TYPE_LABELS: Record<string, string> = {
  SINGLE_ANK: 'Single Ank',
  JODI: 'Jodi',
  SINGLE_PATTI: 'Single Patti',
  DOUBLE_PATTI: 'Double Patti',
  TRIPLE_PATTI: 'Triple Patti',
  HALF_SANGAM: 'Half Sangam',
  FULL_SANGAM: 'Full Sangam',
};

export default function BidsExposureTab() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [bets, setBets] = useState<BetItem[]>([]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'main' | 'starline' | 'jackpot'>('all');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('all');
  const [selectedBetType, setSelectedBetType] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<'all' | 'OPEN' | 'CLOSE'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSelectionNumber, setFilterSelectionNumber] = useState<string | null>(null);
  const [highStakesOnly, setHighStakesOnly] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await getAdminBidsData();
      if (res.success) {
        setMarkets(res.markets);
        setBets(res.bets);
      }
    } catch (err) {
      console.error('Failed to load bids data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Realtime auto-polling every 8 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Markets available under the current category
  const availableMarkets = useMemo(() => {
    if (selectedCategory === 'all') return markets;
    return markets.filter(m => m.category === selectedCategory);
  }, [markets, selectedCategory]);

  // Filtered bets
  const filteredBets = useMemo(() => {
    return bets.filter(b => {
      // Category filter
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      // Market filter
      if (selectedMarketId !== 'all' && b.marketId !== selectedMarketId) return false;
      // Bet type filter
      if (selectedBetType !== 'all' && b.betTypeCode !== selectedBetType) return false;
      // Session filter
      if (selectedSession !== 'all' && b.session !== selectedSession) return false;
      // Clicked selection number filter
      if (filterSelectionNumber !== null && b.selection !== filterSelectionNumber) return false;
      // High Stakes filter (amount >= 150 or Jodi >= 100)
      if (highStakesOnly && !(b.amount >= 150 || (b.betTypeCode === 'JODI' && b.amount >= 100))) return false;
      // Search query (phone or number)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesPhone = b.userPhone.toLowerCase().includes(q);
        const matchesSelection = b.selection.includes(q);
        const matchesMarket = b.marketName.toLowerCase().includes(q);
        if (!matchesPhone && !matchesSelection && !matchesMarket) return false;
      }
      return true;
    });
  }, [bets, selectedCategory, selectedMarketId, selectedBetType, selectedSession, filterSelectionNumber, searchQuery, highStakesOnly]);

  // Aggregated breakdown: "How many people betted on what"
  const aggregatedNumbers = useMemo(() => {
    const map = new Map<string, {
      selection: string;
      totalBets: number;
      totalAmount: number;
      usersSet: Set<string>;
    }>();

    for (const b of filteredBets) {
      const key = b.selection;
      if (!map.has(key)) {
        map.set(key, {
          selection: key,
          totalBets: 0,
          totalAmount: 0,
          usersSet: new Set(),
        });
      }
      const item = map.get(key)!;
      item.totalBets += 1;
      item.totalAmount += b.amount;
      item.usersSet.add(b.userId);
    }

    const list = Array.from(map.values()).map(item => ({
      selection: item.selection,
      totalBets: item.totalBets,
      totalAmount: item.totalAmount,
      uniqueUsers: item.usersSet.size,
    }));

    // Sort by highest amount staked first
    return list.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredBets]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalAmount = filteredBets.reduce((sum, b) => sum + b.amount, 0);
    const uniqueUsers = new Set(filteredBets.map(b => b.userId)).size;
    const topNumber = aggregatedNumbers[0] || null;
    return {
      totalBets: filteredBets.length,
      uniqueUsers,
      totalAmount,
      topNumber,
    };
  }, [filteredBets, aggregatedNumbers]);

  // High-stake bets counter (any ticket >= ₹150, or Jodi >= ₹100)
  const highStakeBetsCount = useMemo(() => {
    return bets.filter(b => b.amount >= 150 || (b.betTypeCode === 'JODI' && b.amount >= 100)).length;
  }, [bets]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: { games: markets.length, bids: bets.length },
      main: { 
        games: markets.filter(m => m.category === 'main').length, 
        bids: bets.filter(b => b.category === 'main').length 
      },
      starline: { 
        games: markets.filter(m => m.category === 'starline').length, 
        bids: bets.filter(b => b.category === 'starline').length 
      },
      jackpot: { 
        games: markets.filter(m => m.category === 'jackpot').length, 
        bids: bets.filter(b => b.category === 'jackpot').length 
      },
    };
  }, [markets, bets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-9 h-9 border-4 border-[#e42e2a]/30 border-t-[#e42e2a] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-50 text-[#e42e2a] rounded-xl font-bold">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              User Bets & Exposure Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Real-time live breakdown of player bids across Main Games, Starline, and Jackpot.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors shadow-sm disabled:opacity-70"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#e42e2a]' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* High-Stake Alert Banner */}
      {highStakeBetsCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#e42e2a] text-white rounded-xl font-bold shadow-sm animate-pulse">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-gray-900 tracking-tight">
                  High-Stake Exposure Alert
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                  {highStakeBetsCount} Flagged
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {highStakeBetsCount} {highStakeBetsCount === 1 ? 'ticket' : 'tickets'} exceed ₹150 (or ₹100 on Jodi). Review numbers before declaring results.
              </p>
            </div>
          </div>
          <button
            onClick={() => setHighStakesOnly(!highStakesOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 ${
              highStakesOnly
                ? 'bg-[#e42e2a] text-white'
                : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{highStakesOnly ? 'Show All Bets' : 'View High Stakes Only'}</span>
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-[#e42e2a]" />
            Total Bids
          </span>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats.totalBets}</p>
          <span className="text-[10px] text-gray-400 font-bold">Current filtered bids</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Active Players
          </span>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats.uniqueUsers}</p>
          <span className="text-[10px] text-gray-400 font-bold">Unique users placed bids</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            Total Staked
          </span>
          <p className="text-2xl font-black text-gray-900 mt-2">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-gray-400 font-bold">Total volume in play</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Top Bidded Number
          </span>
          <p className="text-2xl font-black text-[#e42e2a] mt-2">
            {stats.topNumber ? `#${stats.topNumber.selection}` : 'None'}
          </p>
          <span className="text-[10px] text-gray-400 font-bold">
            {stats.topNumber ? `₹${stats.topNumber.totalAmount} (${stats.topNumber.uniqueUsers} users)` : 'No bids placed yet'}
          </span>
        </div>
      </div>

      {/* 3. Category Selector Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Categories', stats: categoryCounts.all },
          { id: 'main', label: 'Main Markets', stats: categoryCounts.main },
          { id: 'starline', label: 'Starline Games', stats: categoryCounts.starline },
          { id: 'jackpot', label: 'Jackpot Games', stats: categoryCounts.jackpot },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id as any);
              setSelectedMarketId('all'); // reset market selection on category change
              setFilterSelectionNumber(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-[#e42e2a] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              selectedCategory === cat.id ? 'bg-red-800 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {cat.stats.games} Games {cat.stats.bids > 0 ? `• ${cat.stats.bids} Bids` : ''}
            </span>
          </button>
        ))}
      </div>

      {/* 4. Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Game / Market Selector */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
              Select Game
            </label>
            <select
              value={selectedMarketId}
              onChange={(e) => {
                setSelectedMarketId(e.target.value);
                setFilterSelectionNumber(null);
              }}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e42e2a]"
            >
              <option value="all">All Games ({availableMarkets.length})</option>
              {availableMarkets.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bet Type Filter */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
              Bet Type
            </label>
            <select
              value={selectedBetType}
              onChange={(e) => {
                setSelectedBetType(e.target.value);
                setFilterSelectionNumber(null);
              }}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e42e2a]"
            >
              <option value="all">All Bet Types</option>
              {Object.entries(BET_TYPE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Session Filter */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
              Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e42e2a]"
            >
              <option value="all">All Sessions</option>
              <option value="OPEN">🟢 Open Session</option>
              <option value="CLOSE">🔴 Close Session</option>
            </select>
          </div>

          {/* Fast Search Input */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
              Search Player / Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Phone or Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:border-[#e42e2a]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
          </div>
        </div>

        {/* Active Number Filter Banner */}
        {filterSelectionNumber !== null && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
            <span className="text-xs font-bold text-[#e42e2a] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Showing only players who bet on number: <strong className="text-sm font-black underline">{filterSelectionNumber}</strong>
            </span>
            <button
              onClick={() => setFilterSelectionNumber(null)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-white px-2 py-0.5 rounded-lg border border-gray-200"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* 5. "How Many People Betted on What" — Visual Exposure Grid */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <span>Bids Placed by Number</span>
              <span className="text-xs font-bold text-gray-400">({aggregatedNumbers.length} unique numbers)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any number card to instantly inspect which users placed bets on it below.
            </p>
          </div>
          {filterSelectionNumber !== null && (
            <button
              onClick={() => setFilterSelectionNumber(null)}
              className="text-xs text-[#e42e2a] font-bold hover:underline"
            >
              Show all numbers
            </button>
          )}
        </div>

        {aggregatedNumbers.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-500">No bets match the selected criteria.</p>
            <p className="text-xs text-gray-400 mt-1">Try switching category or resetting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {aggregatedNumbers.map((item) => {
              const isSelected = filterSelectionNumber === item.selection;
              const maxAmount = aggregatedNumbers[0]?.totalAmount || 1;
              const percentage = Math.min(100, Math.round((item.totalAmount / maxAmount) * 100));

              return (
                <div
                  key={item.selection}
                  onClick={() => {
                    setFilterSelectionNumber(isSelected ? null : item.selection);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-red-50 border-[#e42e2a] shadow-md ring-2 ring-red-400'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-black text-gray-900 tracking-wider">
                      {item.selection}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {item.uniqueUsers} {item.uniqueUsers === 1 ? 'user' : 'users'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-gray-400 font-bold">{item.totalBets} bids</span>
                      <span className="text-xs font-black text-[#e42e2a]">₹{item.totalAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Mini volume indicator */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#e42e2a] h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Detailed Player Bids List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <span>Detailed Player Bids List</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#e42e2a] border border-red-100">
              {filteredBets.length} records
            </span>
          </h3>
          <span className="text-xs text-gray-400 font-medium">Viewing only</span>
        </div>

        {filteredBets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-gray-400">No individual bids found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Player / User</th>
                  <th className="px-4 py-3">Game Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Bet Type</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3 text-center">Selection Number</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                  <th className="px-4 py-3">Placed At</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* User Phone */}
                    <td className="px-4 py-3">
                      <div className="font-black text-gray-900">{bet.userPhone}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {bet.userId.substring(0, 8)}</div>
                    </td>

                    {/* Game Name */}
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {bet.marketName}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        bet.category === 'main'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : bet.category === 'starline'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {bet.category}
                      </span>
                    </td>

                    {/* Bet Type */}
                    <td className="px-4 py-3 font-bold text-gray-700">
                      {BET_TYPE_LABELS[bet.betTypeCode] || bet.betTypeCode}
                    </td>

                    {/* Session */}
                    <td className="px-4 py-3">
                      {bet.category === 'main' ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          bet.session === 'OPEN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {bet.session}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">—</span>
                      )}
                    </td>

                    {/* Selection */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-900 font-mono font-black text-sm rounded-lg border border-gray-200 shadow-2xs">
                        {bet.selection}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right">
                      {bet.amount >= 150 || (bet.betTypeCode === 'JODI' && bet.amount >= 100) ? (
                        <div className="flex flex-col items-end">
                          <span className="font-black text-red-600 text-sm">
                            ₹{bet.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                            <Flame className="w-2.5 h-2.5 text-amber-600" />
                            High Stake
                          </span>
                        </div>
                      ) : (
                        <span className="font-black text-gray-900 text-sm">
                          ₹{bet.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    {/* Placed At */}
                    <td className="px-4 py-3 text-gray-500 text-[11px] font-medium whitespace-nowrap">
                      {new Date(bet.placedAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      <span className="text-gray-400 block text-[10px]">
                        {new Date(bet.placedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        bet.status === 'ACTIVE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : bet.status === 'WON'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : bet.status === 'LOST'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {bet.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
