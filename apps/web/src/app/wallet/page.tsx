'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  Bell, 
  Wallet, 
  CreditCard, 
  Building2, 
  ArrowUpRight, 
  RefreshCw, 
  Banknote, 
  History as HistoryIcon, 
  BookOpen, 
  Home as HomeIcon, 
  Headphones, 
  X, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';
import { getWalletAction, getUserPaymentDetailsAction } from '@/app/actions/wallet';
import { getUserAction } from '@/app/actions/auth';
import { useApp } from '@/lib/store';

export default function FundsPage() {
  const router = useRouter();
  const { wallet } = useApp();
  const [balance, setBalance] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedHistoryModal, setSelectedHistoryModal] = useState<'BANK' | 'UPI' | null>(null);

  useEffect(() => {
    // Fetch live balance
    getWalletAction().then(res => {
      if (res.success && res.balances) {
        setBalance(res.balances.totalBalance);
      }
    });

    // Fetch user payment records
    getUserPaymentDetailsAction().then(res => {
      if (res.success && res.details) {
        setPaymentDetails(res.details);
      }
    });
  }, []);

  const currentDisplayBalance = wallet?.totalBalance ?? balance;

  const handleNav = (path: string) => {
    audioHaptics.playTap();
    router.push(path);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fbf2f2] text-gray-900 pb-24 select-none">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100 px-4 py-3 flex items-center justify-between shadow-2xs">
        {/* Menu Toggle */}
        <button
          onClick={() => {
            audioHaptics.playTap();
            setShowMenu(true);
          }}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-800 shadow-2xs active:scale-95 transition-transform"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('/')}
          className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e42e2a] to-[#c61e1b] flex items-center justify-center text-white font-black text-xl shadow-xs">
            7
          </div>
          <span className="text-xl font-black tracking-tight text-[#e42e2a]">
            MANTRI777
          </span>
        </div>

        {/* Right Side: Balance Pill + Notifications */}
        <div className="flex items-center gap-2">
          {/* Balance Pill */}
          <div 
            onClick={() => handleNav('/passbook')}
            className="flex items-center gap-1.5 bg-white border border-gray-200 pl-1 pr-3 py-1 rounded-full shadow-2xs cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-6 h-6 rounded-full bg-[#e42e2a] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              ₹
            </div>
            <span className="font-black text-xs md:text-sm text-gray-900">
              {currentDisplayBalance.toFixed(2)}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => handleNav('/notifications')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-2xs active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Cards */}
      <main className="flex-1 px-4 py-5 space-y-5 max-w-md mx-auto w-full">
        {/* CARD 1: Cashier */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#e42e2a] text-white py-2.5 px-4 text-center">
            <h2 className="text-base font-black tracking-wide">Cashier</h2>
          </div>

          {/* Items List */}
          <div className="divide-y divide-gray-100">
            {/* Add Fund */}
            <div
              onClick={() => handleNav('/wallet/add-money')}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wallet className="w-5 h-5 fill-[#e42e2a]/20 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">Add Fund</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>

            {/* Withdraw Fund */}
            <div
              onClick={() => handleNav('/wallet/withdraw')}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 fill-[#e42e2a]/20 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">Withdraw Fund</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>

            {/* Add Bank Details */}
            <div
              onClick={() => handleNav('/payment-setup?method=BANK')}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5 fill-[#e42e2a]/20 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">Add Bank Details</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>

            {/* Add UPI ID */}
            <div
              onClick={() => handleNav('/payment-setup?method=UPI')}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 fill-[#e42e2a]/20 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">Add UPI ID</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: History */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#e42e2a] text-white py-2.5 px-4 text-center">
            <h2 className="text-base font-black tracking-wide">History</h2>
          </div>

          {/* Items List */}
          <div className="divide-y divide-gray-100">
            {/* Deposit History */}
            <div
              onClick={() => handleNav('/passbook?type=deposit')}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">Deposit History</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>

            {/* Withdraw History */}
            <div
              onClick={() => handleNav('/passbook?type=withdrawal')}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Banknote className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">Withdraw History</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>

            {/* Bank Details History */}
            <div
              onClick={() => {
                audioHaptics.playTap();
                setSelectedHistoryModal('BANK');
              }}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5 fill-[#e42e2a]/20 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">Bank Details History</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>

            {/* UPI ID History */}
            <div
              onClick={() => {
                audioHaptics.playTap();
                setSelectedHistoryModal('UPI');
              }}
              className="px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e42e2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 fill-[#e42e2a]/20 stroke-[2.2]" />
                </div>
                <span className="text-sm md:text-base font-black text-gray-900">UPI ID History</span>
              </div>
              <span className="text-red-400 font-black text-sm tracking-tighter">
                &gt;&gt;&gt;
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-red-100 shadow-lg px-2 py-1.5 flex items-center justify-around max-w-md mx-auto">
        {/* History */}
        <button
          onClick={() => handleNav('/passbook')}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 py-1 px-2 transition-colors active:scale-95"
        >
          <HistoryIcon className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-bold">History</span>
        </button>

        {/* Passbook */}
        <button
          onClick={() => handleNav('/passbook')}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 py-1 px-2 transition-colors active:scale-95"
        >
          <BookOpen className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-bold">Passbook</span>
        </button>

        {/* Home */}
        <button
          onClick={() => handleNav('/')}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 py-1 px-2 transition-colors active:scale-95"
        >
          <HomeIcon className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Funds (Active Red) */}
        <button
          onClick={() => handleNav('/wallet')}
          className="flex flex-col items-center gap-1 text-[#e42e2a] py-1 px-2 transition-colors active:scale-95"
        >
          <div className="relative">
            <Wallet className="w-5 h-5 stroke-[2.5] fill-[#e42e2a]/20" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#e42e2a]"></span>
          </div>
          <span className="text-[10px] font-black">Funds</span>
        </button>

        {/* Support */}
        <button
          onClick={() => handleNav('/support')}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 py-1 px-2 transition-colors active:scale-95"
        >
          <Headphones className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-bold">Support</span>
        </button>
      </nav>

      {/* 4. Sliding Side Drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-fade-in">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-5 animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#e42e2a] text-white flex items-center justify-center font-black">
                    7
                  </div>
                  <span className="font-black text-lg text-[#e42e2a]">MANTRI777</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNav('/');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-red-50 hover:text-[#e42e2a] transition-colors"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span>Home Markets</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNav('/wallet');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-red-50 text-[#e42e2a]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Funds & Cashier</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNav('/passbook');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-red-50 hover:text-[#e42e2a] transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Passbook & Bets</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNav('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-red-50 hover:text-[#e42e2a] transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>My Profile & Security</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNav('/support');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-red-50 hover:text-[#e42e2a] transition-colors"
                >
                  <Headphones className="w-4 h-4" />
                  <span>24x7 WhatsApp Support</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 text-center">
              <span className="text-[11px] text-gray-400 font-bold">MANTRI777 Secure v2.4</span>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowMenu(false)}></div>
        </div>
      )}

      {/* 5. Modals for Bank & UPI Details History */}
      {selectedHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-200 shadow-xl space-y-4 relative">
            <button
              onClick={() => setSelectedHistoryModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedHistoryModal === 'BANK' ? (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e42e2a] flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-black text-gray-900">Saved Bank Details</h3>
                  <p className="text-xs text-gray-500 mt-1">Used for automatic payout withdrawals</p>
                </div>

                {paymentDetails?.bankAccountNumber ? (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-left">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Account Holder</span>
                      <span className="text-xs font-black text-gray-900">{paymentDetails.bankAccountName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Bank Name</span>
                      <span className="text-xs font-black text-gray-900">{paymentDetails.bankName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Account Number</span>
                      <span className="text-xs font-mono font-black text-gray-900">•••• •••• {paymentDetails.bankAccountNumber.slice(-4)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">IFSC Code</span>
                      <span className="text-xs font-mono font-black text-gray-900">{paymentDetails.bankIfsc || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-800">No bank account details saved yet.</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedHistoryModal(null);
                    handleNav('/payment-setup?method=BANK');
                  }}
                  className="w-full bg-[#e42e2a] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-colors"
                >
                  {paymentDetails?.bankAccountNumber ? 'Update Bank Details' : 'Add Bank Details Now'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e42e2a] flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-black text-gray-900">Saved UPI ID</h3>
                  <p className="text-xs text-gray-500 mt-1">Used for instant 1-tap payout withdrawals</p>
                </div>

                {paymentDetails?.upiId ? (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-left">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Active UPI VPA</span>
                      <span className="text-sm font-mono font-black text-blue-700">{paymentDetails.upiId}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-green-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span>Verified for Instant Payouts</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-800">No UPI ID saved yet.</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedHistoryModal(null);
                    handleNav('/payment-setup?method=UPI');
                  }}
                  className="w-full bg-[#e42e2a] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-colors"
                >
                  {paymentDetails?.upiId ? 'Update UPI ID' : 'Add UPI ID Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
