'use client';

import React, { useState, useEffect } from 'react';
import { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } from '@/app/actions/withdrawals';
import { Check, X, Search, Clock, ArrowRightLeft, ShieldAlert, Copy, Landmark, Smartphone } from 'lucide-react';

export default function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [rejectReason, setRejectReason] = useState('');
  
  const [actualAmount, setActualAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

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
      res = await approveWithdrawal(
        selectedWithdrawal.id, 
        parseInt(actualAmount),
        paymentMethod,
        paymentReference,
        paymentNote
      );
    } else {
      res = await rejectWithdrawal(selectedWithdrawal.id, rejectReason);
    }

    if (res.success) {
      setActionType(null);
      setSelectedWithdrawal(null);
      setRejectReason('');
      setActualAmount('');
      setPaymentMethod('UPI');
      setPaymentReference('');
      setPaymentNote('');
      loadWithdrawals();
    } else {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
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
        <p><strong>Manual Workflow:</strong> Check the user's bank details, open your GPay/PhonePe, send the exact amount, and record the UTR here to approve. If you reject, funds will be refunded to their app wallet.</p>
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
                      onClick={() => { setSelectedWithdrawal(req); setActionType('REJECT'); setRejectReason(''); }}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors border border-red-100"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => { 
                        setSelectedWithdrawal(req); 
                        setActionType('APPROVE'); 
                        setActualAmount(req.amount.toString());
                        setPaymentMethod(req.user?.upiId ? 'UPI' : 'BANK_TRANSFER');
                        setPaymentReference('');
                        setPaymentNote('');
                      }}
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
                          onClick={() => { setSelectedWithdrawal(req); setActionType('REJECT'); setRejectReason(''); }}
                          className="px-4 py-1.5 text-sm font-bold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => { 
                            setSelectedWithdrawal(req); 
                            setActionType('APPROVE'); 
                            setActualAmount(req.amount.toString());
                            setPaymentMethod(req.user?.upiId ? 'UPI' : 'BANK_TRANSFER');
                            setPaymentReference('');
                            setPaymentNote('');
                          }}
                          className="px-4 py-1.5 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Approve (Manual Pay)
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${actionType === 'APPROVE' ? 'bg-blue-50 text-blue-900' : 'bg-red-50 text-red-900'}`}>
              <h3 className="font-bold">{actionType === 'APPROVE' ? 'Approve & Send Funds' : 'Reject Withdrawal'}</h3>
              <button onClick={() => setActionType(null)} className="p-1 rounded-full hover:bg-white/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5">
              <div className="mb-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Player</p>
                    <p className="text-lg font-black text-gray-900 font-mono">{selectedWithdrawal.user?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount Requested</p>
                    <p className="text-2xl font-black text-[#e42e2a]">₹{selectedWithdrawal.amount}</p>
                  </div>
                </div>

                {actionType === 'APPROVE' && (
                  <>
                    {/* Payment Info Display */}
                    {selectedWithdrawal.user?.upiId ? (
                      <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1"><Smartphone className="w-4 h-4"/> UPI ID</span>
                          <button onClick={() => copyToClipboard(selectedWithdrawal.user.upiId)} className="text-red-600 hover:text-red-900"><Copy className="w-4 h-4" /></button>
                        </p>
                        <p className="text-base font-black text-gray-900">{selectedWithdrawal.user.upiId}</p>
                      </div>
                    ) : selectedWithdrawal.user?.bankAccountNumber ? (
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1"><Landmark className="w-4 h-4"/> Bank Details</span>
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Holder Name</span>
                          <span className="font-bold text-gray-900">{selectedWithdrawal.user.bankAccountName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Account Number</span>
                          <span className="font-bold text-gray-900 font-mono flex items-center gap-2">
                            {selectedWithdrawal.user.bankAccountNumber}
                            <button onClick={() => copyToClipboard(selectedWithdrawal.user.bankAccountNumber)} className="text-blue-600 hover:text-blue-900"><Copy className="w-3.5 h-3.5" /></button>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">IFSC</span>
                          <span className="font-bold text-gray-900 font-mono flex items-center gap-2">
                            {selectedWithdrawal.user.bankIfsc}
                            <button onClick={() => copyToClipboard(selectedWithdrawal.user.bankIfsc)} className="text-blue-600 hover:text-blue-900"><Copy className="w-3.5 h-3.5" /></button>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Bank Name</span>
                          <span className="font-bold text-gray-900">{selectedWithdrawal.user.bankName}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-sm font-bold text-orange-800">User hasn't saved payment details in their profile.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <form onSubmit={handleSubmitAction}>
                {actionType === 'APPROVE' ? (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="font-black text-gray-900">Record Manual Transfer</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Actual Amount Paid (₹)</label>
                        <input
                          type="number"
                          required
                          value={actualAmount}
                          onChange={(e) => setActualAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="UPI">UPI</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="CASH">Cash</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">UTR / Reference Number</label>
                      <input
                        type="text"
                        required
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Required"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Optional Note</label>
                      <input
                        type="text"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="e.g., Sent via GPay"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Reason for rejection</label>
                    <textarea
                      required
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Invalid bank details..."
                      className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                    />
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
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
                    className={`flex-1 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-70 flex items-center justify-center shadow-sm uppercase tracking-wider ${
                      actionType === 'APPROVE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : (actionType === 'APPROVE' ? 'Confirm Payment' : 'Reject & Refund')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
