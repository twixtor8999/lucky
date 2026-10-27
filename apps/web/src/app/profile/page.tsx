'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Lock, 
  Wallet, 
  ShieldCheck, 
  LogOut, 
  CreditCard,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';
import { getUserPaymentDetailsAction } from '../actions/wallet';

export default function ProfilePage() {
  const router = useRouter();
  const { user, wallet, logout, showToast } = useApp();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    getUserPaymentDetailsAction().then((res) => {
      if (res.success && res.details) {
        setPaymentDetails(res.details);
      }
    });
  }, []);

  const handleLogout = () => {
    audioHaptics.playTap();
    logout();
    showToast('info', 'Logged Out', 'You have been logged out successfully');
    router.push('/');
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 bg-gray-50 min-h-screen space-y-5">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#e22e28] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-red-500/20 uppercase">
          {user?.displayName ? user.displayName.slice(0, 2) : 'PL'}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-black text-gray-900">
            {user?.displayName || 'Player'}
          </h2>
          <p className="text-xs text-gray-500 font-bold flex items-center gap-1 mt-0.5">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>+91 {user?.phone || 'XXXXXXXXXX'}</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-black border border-green-200">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Player</span>
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Summary */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e22e28] flex items-center justify-center font-black">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase block">Playable Balance</span>
            <span className="text-xl font-black text-gray-900">
              ₹{wallet ? wallet.totalBalance.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        <Link
          href="/wallet"
          className="bg-[#e22e28] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          Manage Wallet
        </Link>
      </div>

      {/* Account & Security Menu */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden text-sm font-bold text-gray-800">
        <Link
          href="/setup-mpin"
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <span>Change 4-Digit MPIN</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/payment-setup"
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <span>Saved Payout Bank / UPI</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/passbook"
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span>Transaction Passbook</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/rates"
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Game Payout Rates</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 hover:bg-red-100 text-[#e22e28] py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-100 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout from Account</span>
      </button>
    </div>
  );
}
