'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Plus, ShieldCheck } from 'lucide-react';
import { getUserDepositsAction } from '@/app/actions/wallet';
import { audioHaptics } from '@/lib/audio-haptics';

export default function DepositHistoryPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getUserDepositsAction();
      if (res.success && res.deposits) {
        setDeposits(res.deposits);
      }
    } catch (err) {
      console.error('Failed to fetch deposit history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link 
            href="/wallet" 
            onClick={() => audioHaptics.playTap()}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Deposit History</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { audioHaptics.playTap(); fetchHistory(); }}
            className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/wallet/add-money"
            onClick={() => audioHaptics.playTap()}
            className="px-3 py-1.5 bg-[#e42e2a] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add</span>
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-500 font-medium mb-6">
        Track your manual UPI deposit requests and admin verification status.
      </p>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 border-4 border-[#e42e2a]/20 border-t-[#e42e2a] rounded-full animate-spin"></div>
        </div>
      ) : deposits.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-sm space-y-4 my-auto">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="font-black text-gray-900 text-base">No Deposit Requests Yet</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
            When you deposit money using your UPI app, your submitted reference requests will appear here.
          </p>
          <Link
            href="/wallet/add-money"
            className="inline-flex px-6 py-3 bg-[#e42e2a] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-red-700 transition-colors"
          >
            Make a Deposit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deposits.map((dep) => {
            const isCompleted = dep.status === 'COMPLETED';
            const isRejected = dep.status === 'REJECTED';
            const isPending = dep.status === 'PENDING';

            return (
              <div 
                key={dep.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        isCompleted
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : isRejected
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {isCompleted ? 'SUCCESS' : dep.status}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {new Date(dep.requestedAt).toLocaleDateString()} at {new Date(dep.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-lg font-black text-gray-900">
                        ₹{dep.amount.toLocaleString()}
                      </span>
                      {dep.actualAmount && dep.actualAmount !== dep.amount && (
                        <span className="text-xs text-green-600 font-bold">
                          (Verified: ₹{dep.actualAmount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-green-50 text-green-600 border border-green-100'
                      : isRejected
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isRejected ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* UTR Pill */}
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">UTR Ref:</span>
                  <span className="font-mono font-bold text-gray-800 tracking-wider select-all">{dep.utr}</span>
                </div>

                {/* Notes & Status messages */}
                {isPending && (
                  <p className="text-[11px] text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 font-medium leading-relaxed">
                    ⏳ Waiting for owner to verify incoming bank payment. Your wallet balance will be credited upon confirmation.
                  </p>
                )}

                {isCompleted && dep.adminNote && (
                  <p className="text-[11px] text-green-800 bg-green-50/70 p-2.5 rounded-xl border border-green-100 font-medium leading-relaxed">
                    ✓ <strong>Verified:</strong> {dep.adminNote}
                  </p>
                )}

                {isRejected && dep.rejectionReason && (
                  <p className="text-[11px] text-red-800 bg-red-50/70 p-2.5 rounded-xl border border-red-100 font-medium leading-relaxed">
                    ✕ <strong>Rejected:</strong> {dep.rejectionReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
