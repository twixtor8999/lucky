'use client';

import React, { useState, useEffect } from 'react';
import { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } from '@/app/actions/withdrawals';
import { Check, X, Search, Clock, ArrowRightLeft, ShieldAlert } from 'lucide-react';

export default function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [inputValue, setInputValue] = useState(''); // UTR for approve, reason for reject
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await getPendingWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(req => 
    req.user && req.user.phone.includes(searchQuery)
  );

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal || !actionType) return;
    
    setIsProcessing(true);
    let res;
    if (actionType === 'APPROVE') {
      res = await approveWithdrawal(selectedWithdrawal.id, inputValue);
    } else {
      res = await rejectWithdrawal(selectedWithdrawal.id, inputValue);
    }

    if (res.success) {
      setActionType(null);
      setSelectedWithdrawal(null);
      setInputValue('');
      loadWithdrawals();
    } else {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[#e42e2a]/30 border-t-[#e42e2a] rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Withdrawal Requests</h2>
          <p className="text-gray-500 text-sm">Review withdrawal requests, send funds via your bank, and approve with UTR.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50 focus:border-[#e42e2a]"
            placeholder="Search phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
        <ShieldAlert className="w-5 h-5 shrink-0 text-blue-600" />
        <p><strong>Manual Workflow:</strong> Check the user's bank details, open your GPay/PhonePe, send the exact amount, and paste the UTR here to approve. If you reject, funds will be refunded to their app wallet.</p>
      </div>

      {/* Responsive List / Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Check className="w-8 h-8 text-green-400 mb-2" />
              <p>No pending withdrawals. Great job!</p>
            </div>
          ) : (
            filteredWithdrawals.map(req => (
              <div key={req.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Player</div>
                    <div className="font-bold text-gray-900">{req.user?.phone || 'Unknown'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Request Amount</div>
                    <div className="font-black text-[#e42e2a] text-lg">₹{req.amount}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(req.requestedAt).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedWithdrawal(req); setActionType('REJECT'); setInputValue(''); }}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors border border-red-100"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => { setSelectedWithdrawal(req); setActionType('APPROVE'); setInputValue(''); }}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                        <Check className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="font-bold text-gray-700">Inbox Zero</p>
                      <p className="text-sm">No pending withdrawal requests.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{req.user?.phone}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(req.requestedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-[#e42e2a] text-lg">₹{req.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedWithdrawal(req); setActionType('REJECT'); setInputValue(''); }}
                          className="px-4 py-1.5 text-sm font-bold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => { setSelectedWithdrawal(req); setActionType('APPROVE'); setInputValue(''); }}
                          className="px-4 py-1.5 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Approve (Paste UTR)
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

      {/* Action Modal */}
      {actionType && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${actionType === 'APPROVE' ? 'bg-blue-50 text-blue-900' : 'bg-red-50 text-red-900'}`}>
              <h3 className="font-bold">{actionType === 'APPROVE' ? 'Approve Withdrawal' : 'Reject Withdrawal'}</h3>
              <button onClick={() => setActionType(null)} className="p-1 rounded-full hover:bg-white/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAction} className="p-5">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Player: <strong className="text-gray-900">{selectedWithdrawal.user?.phone}</strong><br/>
                  Amount: <strong className="text-gray-900 text-lg">₹{selectedWithdrawal.amount}</strong>
                </p>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  {actionType === 'APPROVE' ? 'Bank Transfer UTR Reference' : 'Reason for rejection'}
                </label>
                {actionType === 'APPROVE' ? (
                  <input
                    type="text"
                    required
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter 12-digit UTR..."
                    className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <textarea
                    required
                    rows={3}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. Invalid bank details..."
                    className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  />
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-70 flex items-center justify-center shadow-sm ${
                    actionType === 'APPROVE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : (actionType === 'APPROVE' ? 'Confirm Transfer' : 'Reject & Refund')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
