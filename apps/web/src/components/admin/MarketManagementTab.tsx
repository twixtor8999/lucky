'use client';

import React, { useState, useEffect } from 'react';
import { getAllMarkets, publishOpenResult, publishCloseResult } from '@/app/actions/admin';
import { Trophy, Calendar, X, Megaphone, Zap, Star } from 'lucide-react';

function MarketCard({ market, compact, onPublish }: {
  market: any;
  compact?: boolean;
  onPublish: (market: any, step: 'OPEN' | 'CLOSE') => void;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`font-black text-gray-900 uppercase tracking-tight leading-tight ${compact ? 'text-base' : 'text-xl'}`}>
            {market.name}
          </h3>
          {(market.openTime || market.closeTime) && (
            <div className="text-xs font-medium text-gray-400 flex gap-2 mt-1">
              {market.openTime && <span>Open: {market.openTime}</span>}
              {market.closeTime && <><span>•</span><span>Close: {market.closeTime}</span></>}
            </div>
          )}
        </div>
        <div className={`bg-red-50 rounded-full flex items-center justify-center shrink-0 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
          <Trophy className={`text-[#e42e2a] ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-3">
        <button
          onClick={() => onPublish(market, 'OPEN')}
          className="w-full py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Megaphone className="w-3.5 h-3.5" />
          Publish Open
        </button>
        <button
          onClick={() => onPublish(market, 'CLOSE')}
          className="w-full py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          Publish Close
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, count }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-gray-900 text-lg">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">{count}</span>
        </div>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}

export default function MarketManagementTab() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [publishStep, setPublishStep] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [patti, setPatti] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => { loadMarkets(); }, []);

  const loadMarkets = async () => {
    setLoading(true);
    try {
      const data = await getAllMarkets();
      setMarkets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mainMarkets = markets.filter(m =>
    !m.name.toLowerCase().includes('starline') && !m.name.toLowerCase().includes('jackpot')
  );
  const starlineMarkets = markets.filter(m => m.name.toLowerCase().includes('starline'));
  const jackpotMarkets = markets.filter(m => m.name.toLowerCase().includes('jackpot'));

  const openPublishModal = (market: any, step: 'OPEN' | 'CLOSE') => {
    setSelectedMarket(market);
    setPublishStep(step);
    setPatti('');
    setPublishDate(new Date().toISOString().split('T')[0]);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMarket || !patti) return;
    if (!/^\d{3}$/.test(patti)) {
      alert('Patti must be exactly 3 digits.');
      return;
    }
    setIsPublishing(true);
    let res;
    if (publishStep === 'OPEN') {
      res = await publishOpenResult(selectedMarket.id, publishDate, patti);
      if (res.success) alert('Open Result Published!\nOpen Ank: ' + res.openAnk);
    } else {
      res = await publishCloseResult(selectedMarket.id, publishDate, patti);
      if (res.success) alert('Close Result Published!\nClose Ank: ' + res.closeAnk + ' | Jodi: ' + res.jodi);
    }
    if (res.success) {
      setSelectedMarket(null);
      setPatti('');
      loadMarkets();
    } else {
      alert('Error: ' + res.error);
    }
    setIsPublishing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#e42e2a]/30 border-t-[#e42e2a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Market Management</h2>
        <p className="text-gray-500 text-sm mt-1">Declare Open and Close results. Jodi is calculated automatically.</p>
      </div>

      {/* Section 1: Main Markets */}
      <div>
        <SectionHeader
          icon={<Trophy className="w-5 h-5 text-[#e42e2a]" />}
          title="Main Markets"
          subtitle="Daily main satta matka markets — Kalyan, Milan, Rajdhani, Main Bazar, etc."
          count={mainMarkets.length}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainMarkets.map(market => (
            <MarketCard key={market.id} market={market} onPublish={openPublishModal} />
          ))}
          {mainMarkets.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">
              No main markets found.
            </div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-200" />

      {/* Section 2: Starline */}
      <div>
        <SectionHeader
          icon={<Star className="w-5 h-5 text-[#e42e2a]" />}
          title="Starline Markets"
          subtitle="Hourly fast-paced markets — results declared throughout the day."
          count={starlineMarkets.length}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {starlineMarkets.map(market => (
            <MarketCard key={market.id} market={market} compact onPublish={openPublishModal} />
          ))}
          {starlineMarkets.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">
              No Starline markets found.
            </div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-200" />

      {/* Section 3: Jackpot */}
      <div>
        <SectionHeader
          icon={<Zap className="w-5 h-5 text-[#e42e2a]" />}
          title="Jackpot Markets"
          subtitle="High-value jackpot games declared at set times throughout the day."
          count={jackpotMarkets.length}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {jackpotMarkets.map(market => (
            <MarketCard key={market.id} market={market} compact onPublish={openPublishModal} />
          ))}
          {jackpotMarkets.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">
              No Jackpot markets found.
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {selectedMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">
                Publish {publishStep === 'OPEN' ? 'Open' : 'Close'} Result
              </h3>
              <button onClick={() => setSelectedMarket(null)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePublish} className="p-5">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Market</p>
                    <p className="font-black text-lg text-[#e42e2a]">{selectedMarket.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phase</p>
                    <p className="font-bold text-gray-900">{publishStep}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Result Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        required
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      {publishStep === 'OPEN' ? 'Open Patti' : 'Close Patti'} (3 Digits)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={patti}
                      onChange={(e) => setPatti(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 358"
                      className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-2xl text-center tracking-widest font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      The {publishStep === 'OPEN' ? 'Open Ank' : 'Close Ank + Jodi'} will be calculated automatically.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMarket(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || patti.length !== 3}
                  className="flex-1 py-3 bg-[#e42e2a] text-white font-bold rounded-xl hover:bg-[#d02522] transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
                >
                  {isPublishing ? 'Publishing...' : 'Publish ' + publishStep}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
