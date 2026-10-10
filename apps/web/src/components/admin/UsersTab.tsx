'use client';

import React, { useState, useEffect } from 'react';
import { getUsersWithWallets, confirmWelcomeBonusPayment } from '@/app/actions/admin';
import { Search, Gift, Phone, Calendar, X, CheckCircle2, Copy } from 'lucide-react';

export default function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Payment Form state
  const [actualAmount, setActualAmount] = useState('100');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [utr, setUtr] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersWithWallets();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.phone.includes(searchQuery)
  );

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setProcessing(true);
    const res = await confirmWelcomeBonusPayment(
      selectedUser.id, 
      parseInt(actualAmount),
      paymentMethod,
      utr,
      note
    );
    
    if (res.success) {
      setSelectedUser(null);
      setUtr('');
      setNote('');
      loadUsers(); // Refresh the list
    } else {
      alert(res.error);
    }
    setProcessing(false);
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
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Users & Welcome Bonuses</h2>
          <p className="text-gray-500 text-sm">Manage new users, view their payment details, and confirm manual bonus payments.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50 focus:border-[#e42e2a]"
            placeholder="Search by phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop View: Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4">Registered Date</th>
              <th className="px-6 py-4">Payment Info Provided</th>
              <th className="px-6 py-4 text-center">Bonus Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const hasPaymentInfo = user.upiId || user.bankAccountNumber;
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {hasPaymentInfo ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-black border ${
                        user.welcomeBonusStatus === 'PAID' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {user.welcomeBonusStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.welcomeBonusStatus !== 'PAID' ? (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e42e2a] text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
                        >
                          PAY NOW
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                        >
                          VIEW DETAILS
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Credit Bonus Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#e42e2a]" />
                User Payment Details
              </h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5">
              <div className="mb-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">User Identity</p>
                  <p className="text-lg font-black text-gray-900 font-mono">{selectedUser.phone}</p>
                </div>
                
                {selectedUser.upiId && (
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                      UPI ID Provided
                      <button onClick={() => copyToClipboard(selectedUser.upiId)} className="text-red-600 hover:text-red-900"><Copy className="w-4 h-4" /></button>
                    </p>
                    <p className="text-base font-black text-gray-900">{selectedUser.upiId}</p>
                  </div>
                )}

                {selectedUser.bankAccountNumber && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                      Bank Details Provided
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Holder Name</span>
                      <span className="font-bold text-gray-900">{selectedUser.bankAccountName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Account Number</span>
                      <span className="font-bold text-gray-900 font-mono flex items-center gap-2">
                        {selectedUser.bankAccountNumber}
                        <button onClick={() => copyToClipboard(selectedUser.bankAccountNumber)} className="text-blue-600 hover:text-blue-900"><Copy className="w-3.5 h-3.5" /></button>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">IFSC</span>
                      <span className="font-bold text-gray-900 font-mono">{selectedUser.bankIfsc}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Bank Name</span>
                      <span className="font-bold text-gray-900">{selectedUser.bankName}</span>
                    </div>
                  </div>
                )}
                
                {!selectedUser.upiId && !selectedUser.bankAccountNumber && (
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <p className="text-sm font-bold text-orange-800">No payment details provided by this user yet.</p>
                  </div>
                )}
              </div>

              {selectedUser.welcomeBonusStatus !== 'PAID' && (
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-black text-gray-900 mb-4">Record Manual Payment</h4>
                  <form onSubmit={handleConfirmPayment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Actual Amount Paid (₹)</label>
                        <input
                          type="number"
                          required
                          value={actualAmount}
                          onChange={(e) => setActualAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50"
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
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        placeholder="Required"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50 uppercase"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Optional Note</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., Paid via PhonePe"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full mt-4 py-3 bg-[#e42e2a] text-white font-bold rounded-xl hover:bg-[#d02522] active:bg-[#b81d1b] transition-all disabled:opacity-70 flex items-center justify-center shadow-md uppercase tracking-wider"
                    >
                      {processing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        'CONFIRM PAYMENT & CREDIT WALLET'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
