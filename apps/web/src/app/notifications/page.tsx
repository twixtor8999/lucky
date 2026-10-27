'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Sparkles, CheckCircle2, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAllNotificationsAsRead } = useApp();

  const sampleNotifications = [
    {
      id: 'n-1',
      title: 'Free ₹100 Welcome Bonus Active',
      message: 'Claim your new player welcome bonus to start playing without deposit.',
      time: 'Just now',
      type: 'BONUS',
      unread: true,
    },
    {
      id: 'n-2',
      title: 'Instant Withdrawal Window Live',
      message: 'Withdrawals are processed continuously between 10:00 AM and 08:00 PM IST.',
      time: '1 hour ago',
      type: 'INFO',
      unread: false,
    },
    {
      id: 'n-3',
      title: 'Kalyan & Milan Night Markets Running',
      message: 'Single Ank, Jodi, and Patti bets are open with 9.5x to 10000x payout rates.',
      time: '3 hours ago',
      type: 'MARKET',
      unread: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-gray-500 font-medium">Updates, settlements, and bonuses</p>
          </div>
        </div>

        <button
          onClick={() => markAllNotificationsAsRead()}
          className="text-xs font-bold text-[#e22e28] hover:underline"
        >
          Mark all read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 pt-1">
        {sampleNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`bg-white rounded-3xl p-4 border transition-all shadow-xs space-y-2 ${
              notif.unread ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#e22e28] flex items-center justify-center font-bold">
                  {notif.type === 'BONUS' ? <Sparkles className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <h3 className="font-black text-sm text-gray-900">{notif.title}</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">{notif.time}</span>
            </div>

            <p className="text-xs text-gray-600 font-medium pl-10 leading-relaxed">
              {notif.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
