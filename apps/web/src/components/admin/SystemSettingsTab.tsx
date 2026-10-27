'use client';

import React, { useState, useEffect } from 'react';
import { 
  getGlobalSettings, 
  updateGlobalSettings, 
  updateAdminPassword,
  getUpiPoolAction,
  addUpiAccountAction,
  toggleUpiAccountAction,
  deleteUpiAccountAction,
  updateUpiLimitAction,
  UpiAccount 
} from '@/app/actions/settings';
import { 
  Save, 
  Lock, 
  Settings2, 
  Wallet, 
  PhoneCall, 
  Gift, 
  Smartphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw,
  Layers,
  ShieldCheck,
  CreditCard,
  Building2,
  X,
  AlertCircle
} from 'lucide-react';

export default function SystemSettingsTab() {
  const [settings, setSettings] = useState<any>({
    welcomeBonusAmount: 100,
    minDepositAmount: 500,
    minWithdrawalAmount: 300,
    supportNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Multi-UPI Pool State (Option C: Counter + Auto-Failover)
  const [upiPool, setUpiPool] = useState<UpiAccount[]>([]);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [totalUsedToday, setTotalUsedToday] = useState(0);
  const [poolMsg, setPoolMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add UPI Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newDailyLimit, setNewDailyLimit] = useState<number>(20);
  const [isSubmittingUpi, setIsSubmittingUpi] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const [data, poolRes] = await Promise.all([
        getGlobalSettings(),
        getUpiPoolAction()
      ]);
      setSettings(data);
      if (poolRes.success) {
        setUpiPool(poolRes.pool || []);
        setTotalCapacity(poolRes.totalCapacity || 0);
        setTotalUsedToday(poolRes.totalUsedToday || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateGlobalSettings({
      welcomeBonusAmount: settings.welcomeBonusAmount,
      minDepositAmount: settings.minDepositAmount,
      minWithdrawalAmount: settings.minWithdrawalAmount,
      supportNumber: settings.supportNumber,
    });
    
    if (res.success) {
      alert('Platform settings saved successfully!');
    } else {
      alert(res.error || 'Failed to save settings');
    }
    setIsSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    
    setIsSavingPassword(true);
    const res = await updateAdminPassword(newPassword);
    if (res.success) {
      alert('Admin master password updated successfully!');
      setNewPassword('');
    } else {
      alert(res.error || 'Failed to update password');
    }
    setIsSavingPassword(false);
  };

  // Dedicated Action: Add New UPI Account directly to DB
  const handleAddUpiAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanUpi = newUpiId.trim().toLowerCase();
    if (!cleanUpi || !cleanUpi.includes('@')) {
      setModalError('Please enter a valid UPI ID (must contain @, e.g. business@okhdfcbank)');
      return;
    }

    if (!newPayeeName.trim()) {
      setModalError('Please enter a Payee Name (e.g. Mantri777 Official or Account Holder Name)');
      return;
    }

    setIsSubmittingUpi(true);
    try {
      const res = await addUpiAccountAction({
        upiId: cleanUpi,
        payeeName: newPayeeName.trim(),
        bankName: newBankName.trim() || 'UPI Bank',
        dailyTxnLimit: Number(newDailyLimit) || 20,
      });

      if (res.success) {
        setUpiPool(res.pool);
        const newCap = res.pool.filter((p: UpiAccount) => p.active).reduce((sum: number, p: UpiAccount) => sum + p.dailyTxnLimit, 0);
        setTotalCapacity(newCap);
        
        // Reset form & close modal
        setNewUpiId('');
        setNewPayeeName('');
        setNewBankName('');
        setNewDailyLimit(20);
        setShowAddModal(false);

        setPoolMsg({ type: 'success', text: `UPI ID "${cleanUpi}" added & activated successfully!` });
        setTimeout(() => setPoolMsg(null), 4000);
      } else {
        setModalError(res.error || 'Failed to add UPI ID');
      }
    } catch (err: any) {
      setModalError(err.message || 'An error occurred while adding the UPI account');
    } finally {
      setIsSubmittingUpi(false);
    }
  };

  // Toggle active status (immediate DB update)
  const handleToggleUpi = async (id: string) => {
    // Optimistic UI update
    setUpiPool(prev => prev.map(item => {
      if (item.id === id) {
        const nextActive = !item.active;
        return {
          ...item,
          active: nextActive,
          status: !nextActive ? 'PAUSED' : ((item.usedToday || 0) >= item.dailyTxnLimit ? 'LIMIT_REACHED' : 'HEALTHY')
        };
      }
      return item;
    }));

    try {
      await toggleUpiAccountAction(id);
    } catch (err) {
      loadAllSettings(); // Revert on failure
    }
  };

  // Delete UPI account (immediate DB update)
  const handleDeleteUpi = async (id: string, upiName: string) => {
    if (!confirm(`Are you sure you want to remove "${upiName}" from the deposit rotation?`)) {
      return;
    }

    // Optimistic UI update
    setUpiPool(prev => prev.filter(item => item.id !== id));

    try {
      const res = await deleteUpiAccountAction(id);
      if (res.success) {
        setPoolMsg({ type: 'success', text: `UPI account "${upiName}" removed.` });
        setTimeout(() => setPoolMsg(null), 3000);
      } else {
        alert(res.error || 'Failed to delete account');
        loadAllSettings();
      }
    } catch (err) {
      loadAllSettings();
    }
  };

  // Daily limit update (immediate DB update)
  const handleLimitBlur = async (id: string, newLimit: number) => {
    const validLimit = Math.max(1, newLimit);
    try {
      await updateUpiLimitAction(id, validLimit);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#e42e2a]/30 border-t-[#e42e2a] rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeAccountsCount = upiPool.filter(p => p.active).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-[#e42e2a]" />
          System Settings & Payment Infrastructure
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your receiving UPI accounts pool, deposit routing, and platform parameters.
        </p>
      </div>

      {/* 1. Multi-UPI Deposit Pool (Option C: Counter + Auto-Failover) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-red-50 text-[#e42e2a] rounded-xl font-bold">
                <Smartphone className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                Receiving UPI Accounts Pool
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Auto-Failover Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add your real UPI IDs below. The system automatically routes inbound payments and fails over when an account reaches its daily bank limit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-[#e42e2a] hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New UPI ID</span>
            </button>
          </div>
        </div>

        {poolMsg && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border ${
            poolMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-red-50 text-red-900 border-red-200'
          }`}>
            {poolMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{poolMsg.text}</span>
          </div>
        )}

        {/* Aggregate Pool Health Stats */}
        {upiPool.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Active Channels
              </span>
              <span className="text-xl font-black text-gray-900">
                {activeAccountsCount} of {upiPool.length}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Rotating in live pool</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Daily Capacity
              </span>
              <span className="text-xl font-black text-emerald-600">
                {totalCapacity} txns/day
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Safe from bank caps</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Today's Inbound Load
              </span>
              <span className="text-xl font-black text-gray-900">
                {totalUsedToday} <span className="text-xs text-gray-400">/ {totalCapacity}</span>
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Assigned today</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Estimated Volume Headroom
              </span>
              <span className="text-xl font-black text-blue-600">
                ₹{(totalCapacity * 500).toLocaleString('en-IN')}+
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">At ₹500 avg ticket</span>
            </div>
          </div>
        )}

        {/* UPI Accounts Table / Empty State */}
        {upiPool.length === 0 ? (
          <div className="text-center py-12 px-4 bg-gray-50/70 rounded-3xl border-2 border-dashed border-gray-200 space-y-4">
            <div className="w-16 h-16 bg-red-50 text-[#e42e2a] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CreditCard className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-black text-gray-900">
                No Receiving UPI IDs Configured Yet
              </h4>
              <p className="text-xs text-gray-500">
                You have not entered any UPI accounts. Add at least one receiving UPI ID (e.g. PhonePe, GPay, or Paytm VPA) so players can deposit funds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setShowAddModal(true);
              }}
              className="px-5 py-3 bg-[#e42e2a] hover:bg-red-700 text-white rounded-xl text-xs font-black inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Your First UPI ID</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-center">Rotation Status</th>
                  <th className="px-4 py-3">UPI ID / VPA</th>
                  <th className="px-4 py-3">Payee Name</th>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3 text-center">Today's Usage</th>
                  <th className="px-4 py-3 text-center">Daily Limit</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upiPool.map((account, index) => {
                  const used = account.usedToday || 0;
                  const limit = account.dailyTxnLimit || 20;
                  const percentage = Math.min(100, Math.round((used / limit) * 100));

                  return (
                    <tr key={account.id} className={`hover:bg-gray-50/80 transition-colors ${!account.active ? 'opacity-50 bg-gray-50/40' : ''}`}>
                      {/* Status Toggle & Badge */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleUpi(account.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            !account.active
                              ? 'bg-gray-100 text-gray-600 border-gray-300'
                              : account.status === 'LIMIT_REACHED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : account.status === 'NEAR_LIMIT'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                          title="Click to toggle Active / Paused"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            !account.active
                              ? 'bg-gray-400'
                              : account.status === 'LIMIT_REACHED'
                              ? 'bg-red-500'
                              : account.status === 'NEAR_LIMIT'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-500 animate-pulse'
                          }`}></span>
                          <span>{account.status || (account.active ? 'HEALTHY' : 'PAUSED')}</span>
                        </button>
                      </td>

                      {/* UPI ID */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-gray-900 text-xs select-all">
                          {account.upiId}
                        </div>
                        {index === 0 && (
                          <span className="text-[9px] font-black text-[#e42e2a] uppercase tracking-wider block">
                            Primary Account
                          </span>
                        )}
                      </td>

                      {/* Payee Name */}
                      <td className="px-4 py-3 font-bold text-gray-800">
                        {account.payeeName}
                      </td>

                      {/* Bank */}
                      <td className="px-4 py-3 text-gray-500">
                        {account.bankName || 'UPI Bank'}
                      </td>

                      {/* Usage Progress Bar */}
                      <td className="px-4 py-3">
                        <div className="w-32 mx-auto">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span className={used >= limit ? 'text-red-600' : 'text-gray-700'}>
                              {used} / {limit}
                            </span>
                            <span className="text-gray-400">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                used >= limit ? 'bg-red-500' : used >= limit - 3 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Daily Limit Input */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          defaultValue={account.dailyTxnLimit}
                          onBlur={(e) => handleLimitBlur(account.id, parseInt(e.target.value) || 20)}
                          className="w-16 p-1 text-center font-bold text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e42e2a]"
                          title="Daily inbound transaction cap"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUpi(account.id, account.upiId)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove from pool"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add UPI Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-50 text-[#e42e2a] rounded-xl font-bold">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    Add Receiving UPI Account
                  </h3>
                  <p className="text-xs text-gray-500">
                    Enter your real receiving UPI ID for player deposits.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddUpiAccount} className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">
                  UPI ID / VPA *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  value={newUpiId}
                  onChange={(e) => setNewUpiId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#e42e2a] focus:bg-white transition-all font-mono"
                  autoFocus
                />
                <span className="text-[11px] text-gray-400 font-medium mt-1 block">
                  Must be an active, verified UPI ID capable of receiving payments.
                </span>
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">
                  Payee Account Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mantri777 Official or A Enterprises"
                  value={newPayeeName}
                  onChange={(e) => setNewPayeeName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#e42e2a] focus:bg-white transition-all"
                />
                <span className="text-[11px] text-gray-400 font-medium mt-1 block">
                  Name shown to the player when scanning the QR code in PhonePe/GPay.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">
                    Bank Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC / Paytm / SBI"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#e42e2a] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">
                    Daily Txn Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newDailyLimit}
                    onChange={(e) => setNewDailyLimit(parseInt(e.target.value) || 20)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#e42e2a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmittingUpi}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUpi}
                  className="px-5 py-2.5 bg-[#e42e2a] hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingUpi ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Save & Activate UPI ID</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Global Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* App Configuration */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-6 border-b border-gray-100 pb-4">
            Platform Limits & Support
          </h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Payment Limits */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Thresholds</h4>
              
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Minimum Deposit Amount (₹)</label>
                  <input
                    type="number"
                    name="minDepositAmount"
                    value={settings.minDepositAmount}
                    onChange={handleChange}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e42e2a]/50 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Minimum Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    name="minWithdrawalAmount"
                    value={settings.minWithdrawalAmount}
                    onChange={handleChange}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e42e2a]/50 font-bold"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Bonuses */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promotions</h4>
              
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Default Welcome Bonus (₹)</label>
                  <p className="text-xs text-gray-500 mb-2">Credited to newly registered verified players.</p>
                  <input
                    type="number"
                    name="welcomeBonusAmount"
                    value={settings.welcomeBonusAmount}
                    onChange={handleChange}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e42e2a]/50 font-bold"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Support Contact */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Support</h4>
              
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Support WhatsApp Number</label>
                  <input
                    type="text"
                    name="supportNumber"
                    value={settings.supportNumber}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="block w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e42e2a]/50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Configuration</>}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings & Platform Guidelines */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              Security
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Change Admin Master Password</label>
                <p className="text-xs text-gray-500 mb-3">This is the master password used to authenticate into the admin control panel.</p>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e42e2a]/50"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSavingPassword || !newPassword}
                className="w-full py-3 bg-[#e42e2a] text-white font-bold rounded-xl hover:bg-[#d02522] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>UPI Rotation Architecture</span>
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Zero Mock Data:</strong> Only real UPI IDs added by you will be presented to players.</li>
              <li><strong>Load Balancing:</strong> Each account handles up to its daily cap before the next account automatically takes over.</li>
              <li><strong>Instant Pause:</strong> Click on any status pill to pause an account immediately during bank maintenance.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
