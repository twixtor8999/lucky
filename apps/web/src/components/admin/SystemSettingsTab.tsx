'use client';

import React, { useState, useEffect } from 'react';
import { getGlobalSettings, updateGlobalSettings, updateAdminPassword } from '@/app/actions/settings';
import { Save, Lock, Settings2, Wallet, PhoneCall, Gift, Smartphone } from 'lucide-react';

export default function SystemSettingsTab() {
  const [settings, setSettings] = useState<any>({
    welcomeBonusAmount: 100,
    minDepositAmount: 500,
    minWithdrawalAmount: 300,
    supportNumber: '',
    upiId: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getGlobalSettings();
      setSettings(data);
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
      upiId: settings.upiId,
    });
    
    if (res.success) {
      alert('Global Settings saved successfully!');
    } else {
      alert(res.error);
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
      alert('Admin password updated successfully. Make sure to remember it!');
      setNewPassword('');
    } else {
      alert(res.error);
    }
    setIsSavingPassword(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[#e42e2a]/30 border-t-[#e42e2a] rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-[#e42e2a]" />
          System Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure global platform limits, support details, and admin security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Global Configurations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-6 border-b border-gray-100 pb-4">App Configuration</h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Payment Limits */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Limits</h4>
              
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
                  <p className="text-xs text-gray-500 mb-2">Used as the default amount in the Users tab.</p>
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

            {/* Contact & Payments */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact & Payments</h4>
              
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

              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-[#e42e2a]/10 rounded-full flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-[#e42e2a]" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Admin UPI ID (For Deposits)</label>
                  <input
                    type="text"
                    name="upiId"
                    value={settings.upiId}
                    onChange={handleChange}
                    placeholder="e.g. yourname@ybl"
                    className="block w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e42e2a]/50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Configuration</>}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              Security
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Change Admin Password</label>
                <p className="text-xs text-gray-500 mb-3">This is the master password used to access the `/super-secret-admin` panel.</p>
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
                className="w-full py-3 bg-[#e42e2a] text-white font-bold rounded-xl hover:bg-[#d02522] transition-colors disabled:opacity-50"
              >
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">
            <h4 className="font-bold text-gray-900 mb-2">Platform Control Guidelines</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Zero Automated Payouts:</strong> To prevent fraud, this platform operates on a 100% manual financial ledger. No funds move automatically between the real bank and the app.</li>
              <li><strong>Ledger Integrity:</strong> All wallet additions/deductions are strictly logged in the immutable ledger table. You cannot delete ledger entries.</li>
              <li><strong>Deposit Verification:</strong> Always verify UTRs in your bank app before clicking "Approve" in the Deposits tab.</li>
              <li><strong>Result Declaration:</strong> Be careful when declaring market results. Once published, it immediately impacts pending bets.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
