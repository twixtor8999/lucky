'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Volume2, ShieldCheck, Moon, Sun, Smartphone } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function SettingsPage() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden text-sm font-bold text-gray-800">
        <Link
          href="/setup-mpin"
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="block">Change Security MPIN</span>
              <span className="text-[11px] text-gray-400 font-normal">Update your 4-digit transaction passcode</span>
            </div>
          </div>
          <span className="text-xs text-[#e22e28] font-bold">Change</span>
        </Link>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="block">Audio & Haptic Taps</span>
              <span className="text-[11px] text-gray-400 font-normal">Sound effects on bets and keypresses</span>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              soundEnabled ? 'bg-[#e22e28]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="block">Push Notifications</span>
              <span className="text-[11px] text-gray-400 font-normal">Alerts for market openings and results</span>
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              notificationsEnabled ? 'bg-[#e22e28]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-2">
        <h3 className="font-black text-sm text-gray-900">App Information</h3>
        <div className="text-xs text-gray-500 font-medium space-y-1">
          <p>Application: Mantri777 Mobile Edition</p>
          <p>Version: 1.0.5 (Production Build)</p>
          <p>Status: All services operational</p>
        </div>
      </div>
    </div>
  );
}
