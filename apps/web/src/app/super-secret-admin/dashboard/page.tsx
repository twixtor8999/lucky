'use client';

import React, { useState } from 'react';
import UsersTab from '@/components/admin/UsersTab';
import DepositsTab from '@/components/admin/DepositsTab';
import MarketManagementTab from '@/components/admin/MarketManagementTab';
import PendingPayoutsTab from '@/components/admin/PendingPayoutsTab';
import WithdrawalsTab from '@/components/admin/WithdrawalsTab';
import SystemSettingsTab from '@/components/admin/SystemSettingsTab';
import BidsExposureTab from '@/components/admin/BidsExposureTab';
import { Users, CreditCard, History, Trophy, Settings, ArrowRightLeft, Layers } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', name: 'Users & Bonuses', icon: Users },
    { id: 'bids', name: 'User Bets & Exposure', icon: Layers },
    { id: 'deposits', name: 'Deposit Requests', icon: ArrowRightLeft },
    { id: 'results', name: 'Market Management', icon: History },
    { id: 'payouts', name: 'Pending Payouts', icon: Trophy },
    { id: 'withdrawals', name: 'Withdrawal Requests', icon: CreditCard },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 pb-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-[#e42e2a] text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-[#e42e2a]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' ? (
        <UsersTab />
      ) : activeTab === 'bids' ? (
        <BidsExposureTab />
      ) : activeTab === 'deposits' ? (
        <DepositsTab />
      ) : activeTab === 'results' ? (
        <MarketManagementTab />
      ) : activeTab === 'payouts' ? (
        <PendingPayoutsTab />
      ) : activeTab === 'withdrawals' ? (
        <WithdrawalsTab />
      ) : activeTab === 'settings' ? (
        <SystemSettingsTab />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Users, { className: 'w-8 h-8 text-[#e42e2a]' })}
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {tabs.find(t => t.id === activeTab)?.name}
          </h2>
          <p className="text-gray-500 max-w-md">
            This section is currently empty. We will build out the manual controls and data tables for {tabs.find(t => t.id === activeTab)?.name} here.
          </p>
        </div>
      )}
    </div>
  );
}
