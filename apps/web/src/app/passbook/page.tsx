'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Gift, 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';
import { getTransactionHistoryAction } from '@/app/actions/wallet';
import { useApp } from '@/lib/store';

export default function PassbookPage() {
  const router = useRouter();
  const { wallet } = useApp();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'WIN'>('ALL');

  useEffect(() => {
    getTransactionHistoryAction()
      .then((res) => {
        if (res.success && res.transactions) {
          setTransactions(res.transactions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'DEPOSIT') return t.type === 'DEPOSIT';
    if (filter === 'WITHDRAWAL') return t.type === 'WITHDRAWAL';
    if (filter === 'WIN') return t.type === 'BET_WIN' || t.type === 'BONUS';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Passbook</h1>
            <p className="text-xs text-gray-500 font-medium">Immutable audit ledger of all account transactions</p>
          </div>
        </div>

        <Link
          href="/wallet"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-xs"
        >
          <span className="w-4 h-4 rounded-full bg-[#e22e28] text-white flex items-center justify-center text-[10px] font-bold">₹</span>
          <span className="font-black text-xs text-gray-900">
            {wallet ? wallet.totalBalance.toFixed(2) : '0.00'}
          </span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'DEPOSIT', label: 'Deposits' },
          { key: 'WITHDRAWAL', label: 'Withdrawals' },
          { key: 'WIN', label: 'Wins & Bonus' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              audioHaptics.playTap();
              setFilter(tab.key as any);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              filter === tab.key
                ? 'bg-[#e22e28] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-3 pt-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#e22e28] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-black text-gray-900 text-base">No transactions yet</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Deposits, withdrawals, and winning payouts will be recorded here automatically.
            </p>
            <Link
              href="/wallet/add-money"
              className="inline-block bg-[#e22e28] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-red-500/20"
            >
              Deposit Funds
            </Link>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isCredit = tx.type === 'DEPOSIT' || tx.type === 'BET_WIN' || tx.type === 'BONUS';
            const isCompleted = tx.status === 'COMPLETED' || tx.status === 'APPROVED';
            const isPending = tx.status === 'PENDING';

            return (
              <div
                key={tx.id}
                className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-[#e22e28]'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' && <ArrowDownLeft className="w-5 h-5" />}
                    {tx.type === 'WITHDRAWAL' && <ArrowUpRight className="w-5 h-5" />}
                    {tx.type === 'BONUS' && <Gift className="w-5 h-5" />}
                    {tx.type === 'BET_WIN' && <CheckCircle2 className="w-5 h-5" />}
                    {tx.type === 'BET_PLACEMENT' && <FileText className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-gray-900 uppercase">
                      {tx.type.replace('_', ' ')}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-black tracking-tight ${
                      isCredit ? 'text-green-700' : 'text-gray-900'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹{(tx.amountMinor / 100).toFixed(2)}
                  </span>
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                        isCompleted
                          ? 'bg-green-50 text-green-700'
                          : isPending
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
