'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from 'next/link';
import { Play, Clock, ArrowLeft, Trash2, CheckCircle2, AlertCircle, Sparkles, X, ChevronRight } from 'lucide-react';
import { useApp, BET_RULES } from '@/lib/store';
import { BetTypeCode } from '@zenvora/shared';
import { audioHaptics } from '@/lib/audio-haptics';

export default function PlayMarketPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { getMarketBySlug, placeBet, wallet, user } = useApp();

  const market = getMarketBySlug(slug);

  const [selectedType, setSelectedType] = useState<BetTypeCode>(BetTypeCode.SINGLE_ANK);
  const [session, setSession] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [betBasket, setBetBasket] = useState<
    Array<{ id: string; selection: string; session?: 'OPEN' | 'CLOSE'; amount: number; potentialWin: number }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  // Closing countdown timer simulation
  const [timeLeft, setTimeLeft] = useState('00:24:18');

  useEffect(() => {
    let seconds = 24 * 60 + 18;
    const interval = setInterval(() => {
      if (seconds <= 0) return;
      seconds--;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!market) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 min-h-screen">
        <h2 className="text-xl font-bold text-gray-900">Market Not Found</h2>
        <button onClick={() => router.back()} className="text-[#e42e2a] text-sm mt-3 font-semibold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const currentRule = BET_RULES[selectedType];
  const activeAmount = customAmount ? parseInt(customAmount) || 0 : amount;

  // Add selection to slip
  const handleAddToSlip = (num: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    audioHaptics.playChip();
    const potWin = Math.round(activeAmount * currentRule.multiplier);
    const existingIndex = betBasket.findIndex(
      (b) => b.selection === num && (selectedType !== BetTypeCode.SINGLE_ANK || b.session === session)
    );

    if (existingIndex > -1) {
      // update amount
      const updated = [...betBasket];
      updated[existingIndex].amount += activeAmount;
      updated[existingIndex].potentialWin = Math.round(updated[existingIndex].amount * currentRule.multiplier);
      setBetBasket(updated);
    } else {
      setBetBasket((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 7),
          selection: num,
          session: selectedType === BetTypeCode.SINGLE_ANK ? session : undefined,
          amount: activeAmount,
          potentialWin: potWin,
        },
      ]);
    }
  };

  const handleRemoveFromSlip = (id: string) => {
    audioHaptics.playTap();
    setBetBasket((prev) => prev.filter((b) => b.id !== id));
  };

  const totalStake = betBasket.reduce((sum, b) => sum + b.amount, 0);
  const totalPotentialWin = betBasket.reduce((sum, b) => sum + b.potentialWin, 0);

  // Submit all bets in basket
  const handleConfirmPlacement = async () => {
    if (betBasket.length === 0) return;
    if (totalStake > wallet.totalBalance) {
      router.push('/wallet/add-money');
      return;
    }

    setSubmitting(true);
    for (const item of betBasket) {
      await placeBet({
        marketId: market.id,
        betType: selectedType,
        selection: item.selection,
        session: item.session,
        amount: item.amount,
        idempotencyKey: 'idemp-' + Math.random().toString(36).substring(2, 9),
      });
    }
    setSubmitting(false);
    setShowConfirmSheet(false);
    setBetBasket([]);
    router.push('/bets');
  };

  // Pre-generate grid numbers
  const singleAnkDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const popularJodis = [
    '01', '07', '12', '18', '24', '29', '34', '39', '43', '48',
    '52', '57', '61', '66', '70', '75', '83', '88', '92', '99'
  ];
  const popularPattis = [
    '128', '137', '146', '236', '245', '290', '380', '470', '560', '678',
    '118', '227', '335', '443', '551', '669', '777', '888', '999', '000'
  ];

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-40 space-y-5 bg-gray-50 relative min-h-screen">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">{market.name}</h1>
          <span className="text-xs text-[#e42e2a] font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100">{currentRule.name} ({currentRule.multiplier}x)</span>
        </div>

        <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-right">
          <span className="text-[10px] text-gray-500 uppercase font-black block">Closes In</span>
          <span className="text-xs font-mono font-black text-red-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Game Type Selector Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.values(BET_RULES).map((rule) => (
          <button
            key={rule.code}
            onClick={() => {
              audioHaptics.playTap();
              setSelectedType(rule.code);
            }}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-black border transition-all ${
              selectedType === rule.code
                ? 'bg-[#e42e2a] text-white border-[#e42e2a] shadow-md'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            {rule.name}
          </button>
        ))}
      </div>

      {/* Session Toggle (Only for Single Ank / Patti) */}
      {selectedType === BetTypeCode.SINGLE_ANK && (
        <div className="flex gap-3">
          {(['OPEN', 'CLOSE'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                audioHaptics.playTap();
                setSession(s);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-black border transition-all ${
                session === s
                  ? 'bg-red-50 text-[#e42e2a] border-[#e42e2a] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 shadow-sm'
              }`}
            >
              {s === 'OPEN' ? '🟢 Open Session' : '🔴 Close Session'}
            </button>
          ))}
        </div>
      )}

      {/* Fast Amount Chips */}
      <div className="space-y-2">
        <label className="text-xs font-black text-gray-700 uppercase tracking-wider">Select Bet Amount</label>
        <div className="grid grid-cols-5 gap-2">
          {[10, 20, 50, 100, 500].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                audioHaptics.playChip();
                setAmount(amt);
                setCustomAmount('');
              }}
              className={`py-2.5 rounded-xl text-sm font-black border transition-all ${
                amount === amt && !customAmount
                  ? 'bg-[#e42e2a] text-white border-[#e42e2a] shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 shadow-sm hover:border-gray-300'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Number Selection Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
            Tap Number to Add (₹{activeAmount})
          </label>
          <span className="text-[10px] text-[#e42e2a] font-black bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Odds: {currentRule.multiplier}x</span>
        </div>

        {selectedType === BetTypeCode.SINGLE_ANK && (
          <div className="grid grid-cols-5 gap-2">
            {singleAnkDigits.map((d) => (
              <button
                key={d}
                onClick={() => handleAddToSlip(d)}
                className="h-16 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 active:scale-95 transition-all flex flex-col items-center justify-center group shadow-sm"
              >
                <span className="text-2xl font-black text-gray-900 group-hover:text-[#e42e2a]">
                  {d}
                </span>
                <span className="text-[10px] text-gray-400 font-bold mt-0.5">+₹{activeAmount}</span>
              </button>
            ))}
          </div>
        )}

        {selectedType === BetTypeCode.JODI && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {popularJodis.map((j) => (
                <button
                  key={j}
                  onClick={() => handleAddToSlip(j)}
                  className="h-14 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 active:scale-95 transition-all flex flex-col items-center justify-center group shadow-sm"
                >
                  <span className="text-lg font-black text-gray-900 group-hover:text-[#e42e2a]">
                    {j}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">+₹{activeAmount}</span>
                </button>
              ))}
            </div>

            {/* Custom Jodi Input */}
            <div className="bg-white p-2 rounded-2xl border border-gray-200 flex items-center gap-2 shadow-sm">
              <input
                type="text"
                maxLength={2}
                placeholder="Enter any Jodi (00-99)"
                value={selectedNumber}
                onChange={(e) => setSelectedNumber(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-gray-50 px-4 py-3 rounded-xl text-sm font-black text-gray-900 border border-gray-200 focus:border-[#e42e2a] focus:outline-none"
              />
              <button
                disabled={selectedNumber.length !== 2}
                onClick={() => {
                  handleAddToSlip(selectedNumber);
                  setSelectedNumber('');
                }}
                className="bg-[#e42e2a] hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-black disabled:opacity-40 transition-colors uppercase"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {selectedType !== BetTypeCode.SINGLE_ANK && selectedType !== BetTypeCode.JODI && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {popularPattis.map((p) => (
                <button
                  key={p}
                  onClick={() => handleAddToSlip(p)}
                  className="h-14 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 active:scale-95 transition-all flex flex-col items-center justify-center group shadow-sm"
                >
                  <span className="text-base font-black text-gray-900 group-hover:text-[#e42e2a]">
                    {p}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">+₹{activeAmount}</span>
                </button>
              ))}
            </div>

            {/* Custom Patti Input */}
            <div className="bg-white p-2 rounded-2xl border border-gray-200 flex items-center gap-2 shadow-sm">
              <input
                type="text"
                maxLength={3}
                placeholder="Enter 3-digit Patti"
                value={selectedNumber}
                onChange={(e) => setSelectedNumber(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-gray-50 px-4 py-3 rounded-xl text-sm font-black text-gray-900 border border-gray-200 focus:border-[#e42e2a] focus:outline-none tracking-widest"
              />
              <button
                disabled={selectedNumber.length !== 3}
                onClick={() => {
                  handleAddToSlip(selectedNumber);
                  setSelectedNumber('');
                }}
                className="bg-[#e42e2a] hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-black disabled:opacity-40 transition-colors uppercase"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Basket Slips */}
      {betBasket.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3 shadow-md mb-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-900 tracking-wider">
              Selected Bets ({betBasket.length})
            </span>
            <button
              onClick={() => {
                audioHaptics.playTap();
                setBetBasket([]);
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {betBasket.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-gray-900 bg-white px-2 py-1 rounded border border-gray-300">
                    {b.selection}
                  </span>
                  {b.session && <span className="text-[10px] text-gray-500 font-black uppercase bg-gray-200 px-1.5 py-0.5 rounded">{b.session}</span>}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-black text-gray-900 block">₹{b.amount}</span>
                    <span className="text-[10px] font-bold text-green-600">Win: ₹{b.potentialWin}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFromSlip(b.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Placement Bar */}
      {betBasket.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs uppercase font-black text-gray-500">Total:</span>
                <span className="text-xl font-black text-gray-900 tracking-tight">₹{totalStake}</span>
              </div>
              <span className="text-[11px] text-green-600 font-bold block">
                Potential Win: ₹{totalPotentialWin.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                audioHaptics.playTap();
                setShowConfirmSheet(true);
              }}
              className="bg-[#e42e2a] hover:bg-red-700 text-white px-8 py-3.5 rounded-xl text-sm font-black shadow-md flex items-center gap-2 transition-colors uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Place Bets</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Bottom Sheet */}
      {showConfirmSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-5 max-w-md mx-auto w-full shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e42e2a]" />
                <span>Confirm Bet Placement</span>
              </h3>
              <button
                onClick={() => setShowConfirmSheet(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-semibold">Market</span>
                <span className="text-gray-900 font-black">{market.name}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-semibold">Total Selections</span>
                <span className="text-gray-900 font-black">{betBasket.length} bets</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-semibold">Total Amount to Debit</span>
                <span className="text-[#e42e2a] font-black text-base">₹{totalStake}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-semibold">Maximum Potential Win</span>
                <span className="text-green-600 font-black text-base">₹{totalPotentialWin.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmPlacement}
              disabled={submitting}
              className="w-full bg-[#e42e2a] hover:bg-red-700 text-white py-4 rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm & Debit ₹{totalStake}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
