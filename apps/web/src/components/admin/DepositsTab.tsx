'use client';

import React, { useState, useEffect } from 'react';
import { getPendingDeposits, approveDeposit, rejectDeposit } from '@/app/actions/admin';
import { Check, X, Search, Clock, ArrowRightLeft, AlertTriangle } from 'lucide-react';

export default function DepositsTab() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [actualAmount, setActualAmount] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const data = await getPendingDeposits();
      setDeposits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeposits = deposits.filter(dep => 
    dep.utr.includes(searchQuery) || (dep.user && dep.user.phone.includes(searchQuery))
  );

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit || !actualAmount) return;
    
    setProcessingId(selectedDeposit.id);
    const res = await approveDeposit(selectedDeposit.id, parseInt(actualAmount));
    if (res.success) {
      setSelectedDeposit(null);
      setIsApproving(false);
      setActualAmount('');
      loadDeposits();
    } else {
      alert(res.error);
    }
    setProcessingId(null);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit || !rejectReason) return;
    
    setProcessingId(selectedDeposit.id);
    const res = await rejectDeposit(selectedDeposit.id, rejectReason);
    if (res.success) {
      setSelectedDeposit(null);
      setRejectReason('');
      setIsRejecting(false);
      loadDeposits();
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
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Deposit Requests</h2>
          <p className="text-gray-500 text-sm">Verify UTR numbers and manually approve deposits.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50 focus:border-[#e42e2a]"
            placeholder="Search by UTR or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-yellow-800 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-600" />
        <p><strong>Security Notice:</strong> Always open your actual banking app (PhonePe/GPay) to verify the UTR number and confirm the exact amount was received before clicking Approve.</p>
      </div>

      {/* Responsive List / Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredDeposits.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Check className="w-8 h-8 text-green-400 mb-2" />
              <p>No pending deposits! You're all caught up.</p>
            </div>
          ) : (
            filteredDeposits.map(dep => (
              <div key={dep.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">User</div>
                    <div className="font-bold text-gray-900">{dep.user?.phone || 'Unknown'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Amount</div>
                    <div className="font-black text-[#e42e2a] text-lg">₹{dep.amount}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">UTR Reference Number</div>
                  <div className="font-mono text-sm font-bold text-gray-900 break-all">{dep.utr}</div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(dep.requestedAt).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={processingId === dep.id}
                      onClick={() => { setSelectedDeposit(dep); setIsRejecting(true); }}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      disabled={processingId === dep.id}
                      onClick={() => { setSelectedDeposit(dep); setActualAmount(dep.amount.toString()); setIsApproving(true); }}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === dep.id ? '...' : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">UTR Reference</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                        <Check className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="font-bold text-gray-700">Inbox Zero</p>
                      <p className="text-sm">No pending deposit requests to review.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeposits.map(dep => (
                  <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{dep.user?.phone}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 text-xs border border-gray-200 font-bold tracking-widest">{dep.utr}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(dep.requestedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-[#e42e2a] text-lg">₹{dep.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={processingId === dep.id}
                          onClick={() => { setSelectedDeposit(dep); setIsRejecting(true); }}
                          className="px-3 py-1.5 text-sm font-bold rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          disabled={processingId === dep.id}
                          onClick={() => { setSelectedDeposit(dep); setActualAmount(dep.amount.toString()); setIsApproving(true); }}
                          className="px-4 py-1.5 text-sm font-bold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {processingId === dep.id ? 'Processing...' : <><Check className="w-4 h-4" /> Approve</>}
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

      {/* Reject Modal */}
      {isRejecting && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Reject Deposit</h3>
              <button 
                onClick={() => { setIsRejecting(false); setSelectedDeposit(null); }} 
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReject} className="p-5">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Rejecting deposit of <strong className="text-gray-900">₹{selectedDeposit.amount}</strong> for <strong className="text-gray-900">{selectedDeposit.user?.phone}</strong>
                </p>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Reason for rejection</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. UTR mismatch, funds not received, fake receipt..."
                  className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsRejecting(false); setSelectedDeposit(null); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId !== null}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-70 flex items-center justify-center shadow-sm"
                >
                  {processingId ? '...' : 'Reject Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {isApproving && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-green-50">
              <h3 className="font-bold text-green-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Approve Deposit
              </h3>
              <button 
                onClick={() => { setIsApproving(false); setSelectedDeposit(null); }} 
                className="p-1 rounded-full hover:bg-green-100 text-green-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleApprove} className="p-5">
              <div className="mb-6 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Player</span>
                    <span className="font-bold">{selectedDeposit.user?.phone}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Requested Amount</span>
                    <span className="font-bold text-red-600">₹{selectedDeposit.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UTR</span>
                    <span className="font-mono font-bold tracking-tight text-xs">{selectedDeposit.utr}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Actual Amount Received (₹)</label>
                  <input
                    type="number"
                    required
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value)}
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl font-black text-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the exact amount you verified in your bank app. This amount will be credited to the user's wallet.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsApproving(false); setSelectedDeposit(null); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId !== null}
                  className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-70 flex items-center justify-center shadow-md uppercase tracking-wider"
                >
                  {processingId ? '...' : 'CONFIRM & CREDIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
