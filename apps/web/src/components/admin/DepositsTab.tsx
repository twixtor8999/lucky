'use client';

import React, { useState, useEffect } from 'react';
import { getPendingDeposits, approveDeposit, rejectDeposit } from '@/app/actions/admin';
import { 
  Check, 
  X, 
  Search, 
  Clock, 
  AlertTriangle, 
  Eye, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function DepositsTab() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'COMPLETED' | 'REJECTED' | 'ALL'>('PENDING');
  
  // Modals & Actions
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [detailsModal, setDetailsModal] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Form fields for approval
  const [actualAmount, setActualAmount] = useState('');
  const [confirmUtr, setConfirmUtr] = useState('');
  const [adminNote, setAdminNote] = useState('');
  
  // Form fields for rejection
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadDeposits();
  }, [statusFilter]);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const data = await getPendingDeposits(statusFilter);
      setDeposits(data || []);
    } catch (err) {
      console.error('Failed to load deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openApproveModal = (dep: any) => {
    setSelectedDeposit(dep);
    setActualAmount(dep.amount.toString());
    setConfirmUtr(dep.utr);
    setAdminNote('Payment verified in bank statement.');
    setIsApproving(true);
  };

  const openRejectModal = (dep: any) => {
    setSelectedDeposit(dep);
    setRejectReason('');
    setIsRejecting(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit || !actualAmount) return;
    
    const amtNum = parseFloat(actualAmount);
    if (isNaN(amtNum) || amtNum <= 0) {
      alert('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (!confirmUtr.trim()) {
      alert('Please confirm the UTR reference number.');
      return;
    }

    setProcessingId(selectedDeposit.id);
    const res = await approveDeposit(
      selectedDeposit.id, 
      amtNum, 
      confirmUtr.trim(),
      adminNote.trim()
    );

    if (res.success) {
      setIsApproving(false);
      setSelectedDeposit(null);
      loadDeposits();
    } else {
      alert(res.error || 'Failed to approve deposit');
    }
    setProcessingId(null);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit || !rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setProcessingId(selectedDeposit.id);
    const res = await rejectDeposit(selectedDeposit.id, rejectReason.trim());

    if (res.success) {
      setIsRejecting(false);
      setSelectedDeposit(null);
      setRejectReason('');
      loadDeposits();
    } else {
      alert(res.error || 'Failed to reject deposit');
    }
    setProcessingId(null);
  };

  // Filter by search query
  const filteredDeposits = deposits.filter(dep => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const utrMatch = dep.utr?.toLowerCase().includes(q);
    const phoneMatch = dep.user?.phone?.toLowerCase().includes(q);
    const nameMatch = dep.user?.displayName?.toLowerCase().includes(q);
    const idMatch = dep.id?.toLowerCase().includes(q);
    return utrMatch || phoneMatch || nameMatch || idMatch;
  });

  const pendingCount = deposits.filter(d => d.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Manual Deposit Requests</h2>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">
            Verify actual bank/UPI receipts externally before approving wallet credit.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50 focus:border-[#e42e2a] shadow-sm font-medium"
            placeholder="Search UTR, phone, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'PENDING', label: 'Pending Verification' },
          { key: 'COMPLETED', label: 'Approved (Credited)' },
          { key: 'REJECTED', label: 'Rejected' },
          { key: 'ALL', label: 'All Requests' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              statusFilter === tab.key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Verification Warning Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-sm shadow-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <strong className="font-black text-amber-950 uppercase tracking-wide">Verification Rule:</strong> Never approve based solely on user-submitted requests. Open your PhonePe, Google Pay, or bank statement, verify that the funds and UTR match, and enter the actual received amount.
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-200">
          <div className="w-8 h-8 border-4 border-[#e42e2a]/20 border-t-[#e42e2a] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {filteredDeposits.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-800 text-base">No {statusFilter === 'ALL' ? '' : statusFilter.toLowerCase()} deposit requests.</p>
              <p className="text-xs text-gray-400 mt-1">When users submit manual deposits via UPI, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredDeposits.map((dep) => (
                <div key={dep.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: User & Amount Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          ID: {dep.id.substring(0, 8)}
                        </span>
                        
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          dep.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : dep.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {dep.status === 'COMPLETED' ? 'SUCCESS / CREDITED' : dep.status}
                        </span>

                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(dep.requestedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-lg font-black text-gray-900">
                          {dep.user?.displayName || 'Player'} ({dep.user?.phone || 'No Phone'})
                        </span>
                        <span className="text-sm text-gray-400 font-mono">
                          PID: {dep.user?.id ? dep.user.id.substring(0, 8).toUpperCase() : 'N/A'}
                        </span>
                      </div>

                      {/* UTR Reference Pill */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">UTR:</span>
                        <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 tracking-wider">
                          {dep.utr}
                        </span>
                        <button
                          onClick={() => handleCopy(dep.utr, `utr-${dep.id}`)}
                          className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Copy UTR"
                        >
                          {copiedField === `utr-${dep.id}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* User Payment Details Pill (Section 6) */}
                      <div className="pt-1">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5 max-w-xl">
                          <div className="font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            <span>Player Saved Payment Details:</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                            <div>
                              <span className="font-bold text-gray-500">UPI ID:</span>{' '}
                              <span className="font-mono text-gray-900 font-bold">{dep.user?.upiId || 'Not provided'}</span>
                            </div>
                            <div>
                              <span className="font-bold text-gray-500">A/C Name:</span>{' '}
                              <span className="text-gray-900 font-bold">{dep.user?.bankAccountName || 'Not provided'}</span>
                            </div>
                            <div>
                              <span className="font-bold text-gray-500">Bank A/C:</span>{' '}
                              <span className="font-mono text-gray-900 font-bold">{dep.user?.maskedBankAccount || 'Not provided'}</span>
                            </div>
                            <div>
                              <span className="font-bold text-gray-500">IFSC / Bank:</span>{' '}
                              <span className="font-mono text-gray-900 font-bold">{dep.user?.bankIfsc || 'N/A'} {dep.user?.bankName ? `(${dep.user.bankName})` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Note / Rejection Reason Details */}
                      {dep.status === 'COMPLETED' && dep.adminNote && (
                        <div className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 font-medium">
                          <strong>Admin Note:</strong> {dep.adminNote}
                        </div>
                      )}

                      {dep.status === 'REJECTED' && dep.rejectionReason && (
                        <div className="text-xs text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-medium">
                          <strong>Rejection Reason:</strong> {dep.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Right: Amounts & Action Buttons */}
                    <div className="flex flex-col sm:items-end justify-between gap-4 shrink-0 pt-2 lg:pt-0">
                      <div className="sm:text-right">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Requested Amount</span>
                        <span className="text-2xl font-black text-[#e42e2a]">
                          ₹{dep.amount.toLocaleString()}
                        </span>
                        {dep.actualAmount && dep.actualAmount !== dep.amount && (
                          <span className="text-xs text-green-700 font-bold block">
                            Verified: ₹{dep.actualAmount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailsModal(dep)}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {dep.status === 'PENDING' && (
                          <>
                            <button
                              disabled={processingId === dep.id}
                              onClick={() => openRejectModal(dep)}
                              className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold text-xs transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              disabled={processingId === dep.id}
                              onClick={() => openApproveModal(dep)}
                              className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 font-black text-xs transition-colors shadow-md flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Approve</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Deposit Audit Details</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {detailsModal.id}</p>
              </div>
              <button 
                onClick={() => setDetailsModal(null)} 
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 font-bold block uppercase">Requested Amount</span>
                  <span className="text-xl font-black text-[#e42e2a]">₹{detailsModal.amount}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-bold block uppercase">Status</span>
                  <span className="font-black text-gray-900">{detailsModal.status}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-bold block uppercase">UTR Number</span>
                  <span className="font-mono font-bold text-gray-900 break-all">{detailsModal.utr}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-bold block uppercase">Requested Date</span>
                  <span className="text-xs text-gray-700">{new Date(detailsModal.requestedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Player Payout Details */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <h4 className="font-black text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Player Identity & Payout Destination</span>
                </h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-bold text-gray-900">{detailsModal.user?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Display Name:</span>
                    <span className="font-bold text-gray-900">{detailsModal.user?.displayName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UPI ID:</span>
                    <span className="font-mono font-bold text-blue-600">{detailsModal.user?.upiId || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank Account Holder:</span>
                    <span className="font-bold text-gray-900">{detailsModal.user?.bankAccountName || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Masked Account:</span>
                    <span className="font-mono font-bold text-gray-900">{detailsModal.user?.maskedBankAccount || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IFSC Code:</span>
                    <span className="font-mono font-bold text-gray-900">{detailsModal.user?.bankIfsc || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {detailsModal.verifiedAt && (
                <div className="border-t border-gray-100 pt-3 text-xs text-gray-500">
                  Verified at: {new Date(detailsModal.verifiedAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setDetailsModal(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 font-bold text-xs rounded-xl transition-colors text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE VERIFICATION MODAL (Sections 7, 8, 9, 21) */}
      {isApproving && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            <div className="p-5 border-b border-green-100 flex justify-between items-center bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-green-950 text-base">Verify & Credit Deposit</h3>
                  <p className="text-[11px] text-green-700 font-medium">Atomic Ledger Confirmation</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsApproving(false); setSelectedDeposit(null); }} 
                className="p-1 rounded-full hover:bg-green-100 text-green-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
              {/* Warning Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed font-medium">
                <strong>Warning:</strong> Confirm that this payment has actually arrived in your bank/UPI app before proceeding.
              </div>

              {/* Deposit Summary Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Player Phone:</span>
                  <span className="font-bold text-gray-900">{selectedDeposit.user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Requested Amount:</span>
                  <span className="font-black text-[#e42e2a] text-sm">₹{selectedDeposit.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Submitted UTR:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedDeposit.utr}</span>
                </div>
              </div>

              {/* Actual Received Amount Input (Section 7, 8) */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">
                  Actual Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-black text-base">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-xl font-black text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 shadow-sm"
                    placeholder="500"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Credit will match this exact verified amount.
                </p>
              </div>

              {/* Confirm Received UTR */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">
                  Confirm Bank/UPI UTR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={confirmUtr}
                  onChange={(e) => setConfirmUtr(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl font-mono text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 uppercase tracking-widest shadow-sm"
                  placeholder="Confirm UTR number"
                />
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">
                  Admin Verification Note (Optional)
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 shadow-sm font-medium"
                  placeholder="e.g. Verified in PhonePe / HDFC statement"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsApproving(false); setSelectedDeposit(null); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId !== null}
                  className="flex-1 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-green-600/30 text-xs uppercase tracking-wider"
                >
                  {processingId ? 'Processing...' : 'CONFIRM PAYMENT & CREDIT WALLET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL (Section 12) */}
      {isRejecting && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            <div className="p-5 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h3 className="font-black text-red-950 text-base">Reject Deposit Request</h3>
              <button 
                onClick={() => { setIsRejecting(false); setSelectedDeposit(null); }} 
                className="p-1 rounded-full hover:bg-red-100 text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-gray-600 font-medium">
                Rejecting deposit of <strong className="text-gray-900">₹{selectedDeposit.amount}</strong> (UTR: {selectedDeposit.utr}) for player <strong className="text-gray-900">{selectedDeposit.user?.phone}</strong>.
              </p>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'UTR not found in bank statement',
                    'Payment amount does not match',
                    'Duplicate / fake receipt',
                    'Payment reversed / failed'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg border border-gray-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter detailed reason for the player..."
                  className="block w-full p-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none font-medium shadow-sm"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRejecting(false); setSelectedDeposit(null); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId !== null || !rejectReason.trim()}
                  className="flex-1 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-red-600/30 text-xs uppercase tracking-wider"
                >
                  {processingId ? 'Rejecting...' : 'REJECT DEPOSIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
