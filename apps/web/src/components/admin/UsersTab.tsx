'use client';

import React, { useState, useEffect } from 'react';
import { getUsersWithWallets, creditUserBonus } from '@/app/actions/admin';
import { Search, Gift, Wallet, Phone, Calendar, X } from 'lucide-react';

export default function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [bonusAmount, setBonusAmount] = useState('100');
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

  const handleCreditBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setProcessing(true);
    const res = await creditUserBonus(selectedUser.id, parseInt(bonusAmount));
    if (res.success) {
      setSelectedUser(null);
      loadUsers(); // Refresh the list to show new balance
    } else {
      alert(res.error);
    }
    setProcessing(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[#e42e2a]/30 border-t-[#e42e2a] rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Users & Bonuses</h2>
          <p className="text-gray-500 text-sm">Manage players and manual wallet credits.</p>
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

      {/* Responsive List / Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {user.phone}
                  </div>
                  <div className="flex items-center gap-1 font-black text-[#e42e2a]">
                    <Wallet className="w-4 h-4" />
                    ₹{user.balance || 0}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-[#e42e2a] rounded-lg font-bold hover:bg-red-100 active:scale-95 transition-all"
                  >
                    <Gift className="w-3 h-3" />
                    Credit
                  </button>
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
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Wallet Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">{user.phone}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 font-black border border-green-200">
                        ₹{user.balance || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-[#e42e2a] rounded-lg font-bold hover:bg-red-100 transition-colors border border-red-100"
                      >
                        <Gift className="w-4 h-4" />
                        Credit Bonus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Bonus Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Credit Bonus</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreditBonus} className="p-5">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Add funds to <span className="font-bold text-gray-900">{selectedUser.phone}</span>
                </p>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="block w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50 focus:border-[#e42e2a]"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 bg-[#e42e2a] text-white font-bold rounded-xl hover:bg-[#d02522] active:bg-[#b81d1b] transition-all disabled:opacity-70 flex items-center justify-center shadow-[0_5px_15px_rgba(228,46,42,0.3)]"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Add Funds'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
