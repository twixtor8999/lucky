'use client';

import React, { useState, useEffect } from 'react';
import { getAllMarkets, publishOpenResult, publishCloseResult, publishSingleResult } from '@/app/actions/admin';
import { Trophy, Calendar, X, Megaphone, Zap, Star } from 'lucide-react';

// Detect market type from name
function getMarketType(name: string): 'main' | 'starline' | 'jackpot' {
  const n = name.toLowerCase();
  if (n.includes('starline')) return 'starline';
  if (n.includes('jackpot')) return 'jackpot';
  return 'main';
}

// ─── Market Card ──────────────────────────────────────────────────────────────
function MarketCard({ market, compact, onPublish }: {
  market: any;
  compact?: boolean;
  onPublish: (market: any, step: 'OPEN' | 'CLOSE' | 'SINGLE') => void;
}) {
  const type = getMarketType(market.name);
  const isSingle = type === 'starline' || type === 'jackpot';
  const currentResult = market.currentResult;
  const isOpenPublished = type === 'main' && currentResult?.status === 'OPEN_PUBLISHED';
  const isFullyPublished = currentResult?.status === 'PUBLISHED';

  return (
    <div className={`bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow ${isOpenPublished ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'} ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`font-black text-gray-900 uppercase tracking-tight leading-tight ${compact ? 'text-base' : 'text-xl'}`}>
            {market.name}
          </h3>
          {/* Result Display */}
          <div className="mt-1">
            {isOpenPublished ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-base font-black tracking-widest text-blue-600 font-mono">
                  {currentResult.resultValue}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Open: {currentResult.openPatti} (Ank {currentResult.openAnk})
                </span>
              </div>
            ) : isFullyPublished ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-base font-black tracking-widest text-emerald-600 font-mono">
                  {currentResult.resultValue}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Declared
                </span>
              </div>
            ) : (
              <div className="text-xs font-medium text-gray-400">
                {type === 'main' && <span className="text-blue-500 font-bold font-mono">XXX-XX-XXX</span>}
                {type === 'starline' && <span className="text-purple-500 font-bold font-mono">XXX-X</span>}
                {type === 'jackpot' && <span className="text-amber-500 font-bold font-mono">XXX</span>}
              </div>
            )}
          </div>
        </div>
        <div className={`rounded-full flex items-center justify-center shrink-0 ${isOpenPublished ? 'bg-amber-100' : 'bg-red-50'} ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
          <Trophy className={`${isOpenPublished ? 'text-amber-600' : 'text-[#e42e2a]'} ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-3">
        {isSingle ? (
          // Starline / Jackpot: single publish button
          <button
            onClick={() => onPublish(market, 'SINGLE')}
            className="w-full py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Megaphone className="w-3.5 h-3.5" />
            {isFullyPublished ? 'Re-publish Result' : 'Publish Result'}
          </button>
        ) : (
          // Main games: two-step publish
          <>
            <button
              onClick={() => onPublish(market, 'OPEN')}
              className={`w-full py-2 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${
                isOpenPublished 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200' 
                  : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              {isOpenPublished ? `Edit Open (${currentResult.openPatti})` : 'Publish Open'}
            </button>
            <button
              onClick={() => onPublish(market, 'CLOSE')}
              className={`w-full py-2 font-bold rounded-xl transition-colors text-sm ${
                isOpenPublished
                  ? 'bg-[#e42e2a] text-white hover:bg-[#d02522] shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Publish Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketManagementTab() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Publish State
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [publishStep, setPublishStep] = useState<'OPEN' | 'CLOSE' | 'SINGLE'>('OPEN');
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

  const mainMarkets = markets.filter(m => getMarketType(m.name) === 'main');
  const starlineMarkets = markets.filter(m => getMarketType(m.name) === 'starline');
  const jackpotMarkets = markets.filter(m => getMarketType(m.name) === 'jackpot');

  const openPublishModal = (market: any, step: 'OPEN' | 'CLOSE' | 'SINGLE') => {
    setSelectedMarket(market);
    setPublishStep(step);
    if (step === 'OPEN' && market.currentResult?.openPatti) {
      setPatti(market.currentResult.openPatti);
    } else {
      setPatti('');
    }
    setPublishDate(market.currentResult?.resultDate || new Date().toISOString().split('T')[0]);
  };

  // Labels for modal
  const modalTitle = publishStep === 'OPEN' ? 'Publish Open Result'
    : publishStep === 'CLOSE' ? 'Publish Close Result'
    : 'Publish Result';

  const pattiLabel = publishStep === 'OPEN' ? 'Open Patti (3 Digits)'
    : publishStep === 'CLOSE' ? 'Close Patti (3 Digits)'
    : 'Patti (3 Digits)';

  // Result format hint shown in modal
  const formatHint = selectedMarket
    ? getMarketType(selectedMarket.name) === 'starline' ? 'Result will show as: XXX-X'
      : getMarketType(selectedMarket.name) === 'jackpot' ? 'Result will show as: XXX'
      : publishStep === 'OPEN' ? 'Result will show as: XXX-X-*** (Close pending)'
      : 'Final result: XXX-XX-XXX (Jodi auto-calculated)'
    : '';

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMarket || !patti) return;

    if (!/^\d{3}$/.test(patti)) {
      alert('Patti must be exactly 3 digits.');
      return;
    }

    setIsPublishing(true);
    const marketType = getMarketType(selectedMarket.name);
    let res: any;

    if (publishStep === 'SINGLE') {
      res = await publishSingleResult(
        selectedMarket.id,
        publishDate,
        patti,
        marketType as 'starline' | 'jackpot'
      );
      if (res.success) alert('Result Published!\nResult: ' + res.resultValue);
    } else if (publishStep === 'OPEN') {
      res = await publishOpenResult(selectedMarket.id, publishDate, patti);
      if (res.success) alert('Open Result Published!\nOpen Ank: ' + res.openAnk + '\nNow publish Close Result to complete.');
    } else {
      res = await publishCloseResult(selectedMarket.id, publishDate, patti);
      if (res.success) alert('Close Result Published!\nJodi: ' + res.jodi + '\nFull result saved!');
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
        <p className="text-gray-500 text-sm mt-1">
          Main markets: <span className="font-bold text-blue-500">XXX-XX-XXX</span> &nbsp;|&nbsp;
          Starline: <span className="font-bold text-purple-500">XXX-X</span> &nbsp;|&nbsp;
          Jackpot: <span className="font-bold text-amber-500">XXX</span>
        </p>
      </div>

      {/* Section 1: Main Markets */}
      <div>
        <SectionHeader
          icon={<Trophy className="w-5 h-5 text-[#e42e2a]" />}
          title="Main Markets"
          subtitle="Two-step publish: Open first, then Close. Jodi is auto-calculated."
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
          subtitle="Single publish. Format: XXX-X (Patti-Ank, Ank auto-calculated)"
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
          subtitle="Single publish. Format: XXX (just the 3-digit result)"
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
              <h3 className="font-bold text-gray-900">{modalTitle}</h3>
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
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Format</p>
                    <p className="font-bold text-gray-700 text-sm">
                      {getMarketType(selectedMarket.name) === 'starline' && <span className="text-purple-500">XXX-X</span>}
                      {getMarketType(selectedMarket.name) === 'jackpot' && <span className="text-amber-500">XXX</span>}
                      {getMarketType(selectedMarket.name) === 'main' && <span className="text-blue-500">XXX-XX-XXX</span>}
                    </p>
                  </div>
                </div>

                {publishStep === 'CLOSE' && selectedMarket.currentResult?.openPatti && (
                  <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Previously Entered Open</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-black text-gray-900 text-sm">
                        Open Patti: <span className="text-[#e42e2a] font-mono text-base">{selectedMarket.currentResult.openPatti}</span>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        Open Ank: <span className="text-[#e42e2a] font-mono text-base">{selectedMarket.currentResult.openAnk}</span>
                      </p>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white border border-amber-200 text-amber-900 rounded-lg">
                        {selectedMarket.currentResult.openPatti}-{selectedMarket.currentResult.openAnk}-***
                      </span>
                    </div>
                  </div>
                )}

                {publishStep === 'OPEN' && selectedMarket.currentResult?.openPatti && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Current Open Result</p>
                    <p className="text-xs font-medium text-gray-800 mt-0.5">
                      Currently set to Patti <span className="font-bold text-blue-700">{selectedMarket.currentResult.openPatti}</span> (Ank: {selectedMarket.currentResult.openAnk}). You can re-enter or change it below.
                    </p>
                  </div>
                )}

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
                      {pattiLabel}
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
                    <p className="text-xs text-gray-400 mt-2 text-center">{formatHint}</p>
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
                  {isPublishing ? 'Publishing...' : modalTitle}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
