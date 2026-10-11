'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, History, ShieldCheck, Gift, Lock, Clock } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';
import { getWalletAction, getTransactionHistoryAction } from '@/app/actions/wallet';
import { getUserAction } from '@/app/actions/auth';

export default function WalletPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [balances, setBalances] = useState<{
    cashBalance: number;
    bonusBalance: number;
    lockedBalance: number;
    totalBalance: number;
  }>({ cashBalance: 0, bonusBalance: 0, lockedBalance: 0, totalBalance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const userRes = await getUserAction();
        if (userRes.success && userRes.user) {
          setSessionUser(userRes.user);

          const walletRes = await getWalletAction();
          if (walletRes.success && walletRes.balances) {
            setBalances(walletRes.balances);
          }

          const txnRes = await getTransactionHistoryAction();
          if (txnRes.success && txnRes.transactions) {
            setTransactions(txnRes.transactions);
          }
        }
      } catch (err) {
        console.error('Failed to load wallet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-[#e42e2a] border-t-transparent rounded-full"></div></div>;
  }

  if (!sessionUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 min-h-screen">
        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#e42e2a] mb-4 shadow-sm">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Login to Access Wallet</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs font-medium">
          Manage your funds, add deposits, claim bonuses and request instant withdrawals.
        </p>
        <Link
          href="/login"
          onClick={() => audioHaptics.playTap()}
          className="bg-[#e42e2a] text-white hover:bg-red-700 px-8 py-3 rounded-xl text-sm font-bold shadow-md mt-6 transition-colors uppercase tracking-wider"
        >
          Login / Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 pt-6 pb-24 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Wallet & Balances
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Real-time separate balances and immutable audit ledger.
        </p>
      </div>

      {/* Main Wallet Balance Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Total Playable Balance
          </span>
          <div className="flex items-center gap-1 text-[11px] text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Vault</span>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl text-gray-400 font-bold">₹</span>
          <span className="text-5xl font-black text-gray-900 tracking-tight">
            {balances.totalBalance.toLocaleString()}
          </span>
        </div>

        {/* Separated Balance Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Cash</span>
            <span className="text-sm font-black text-gray-900">
              ₹{balances.cashBalance.toLocaleString()}
            </span>
          </div>

          <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
            <span className="text-[10px] uppercase font-bold text-[#e42e2a] flex items-center justify-center gap-1 mb-1">
              <Gift className="w-3 h-3" />
              <span>Bonus</span>
            </span>
            <span className="text-sm font-black text-[#e42e2a]">
              ₹{balances.bonusBalance.toLocaleString()}
            </span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1 mb-1">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </span>
            <span className="text-sm font-black text-gray-400">
              ₹{balances.lockedBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/wallet/add-money"
            onClick={() => audioHaptics.playTap()}
            className="bg-[#e42e2a] text-white hover:bg-red-700 py-3.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Money</span>
          </Link>

          <Link
            href="/wallet/withdraw"
            onClick={() => audioHaptics.playTap()}
            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm uppercase tracking-wider"
          >
            <ArrowUpRight className="w-5 h-5 text-[#e42e2a] stroke-[2.5]" />
            <span>Withdraw</span>
          </Link>
        </div>

        {/* Deposit History Status Link */}
        <Link
          href="/wallet/history"
          onClick={() => audioHaptics.playTap()}
          className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors uppercase tracking-wider mt-1"
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>View Deposit Requests Status</span>
        </Link>
      </div>

      {/* Transaction History Feed */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#e42e2a]" />
            <span>Transaction Ledger</span>
          </h2>
          <span className="text-[11px] text-gray-500 font-bold bg-gray-200 px-2 py-0.5 rounded-md">{transactions.length} records</span>
        </div>

        <div className="space-y-3">
          {transactions.map((txn) => {
            const isCredit =
              txn.type === 'DEPOSIT' ||
              txn.type === 'BET_WON' ||
              txn.type === 'WELCOME_BONUS';

            return (
              <div
                key={txn.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                      isCredit
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : 'bg-red-50 text-[#e42e2a] border border-red-100'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{txn.type.replace('_', ' ')}</h4>
                    <span className="text-[11px] font-medium text-gray-500">
                      {new Date(txn.created_at).toLocaleDateString()} • Ref: {txn.id.substring(0,8)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-black tracking-tight block ${
                      isCredit ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">
                    {txn.status}
                  </span>
                </div>
              </div>
            );
          })}
          
          {transactions.length === 0 && (
             <div className="text-center py-8 text-gray-400 text-sm font-semibold">No transactions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
