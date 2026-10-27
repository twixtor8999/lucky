'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export default function SupportPage() {
  const router = useRouter();

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
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Help & Support</h1>
            <p className="text-xs text-gray-500 font-medium">24/7 Instant VIP assistance for all players</p>
          </div>
        </div>
      </div>

      {/* Primary WhatsApp Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-3xl p-6 shadow-lg shadow-green-600/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Fast Response (1-2 Min)
          </span>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">WhatsApp VIP Helpline</h2>
          <p className="text-xs text-emerald-100 font-medium mt-1 leading-relaxed">
            Direct chat with our customer care manager for deposit approvals, withdrawal inquiries, or game rules.
          </p>
        </div>

        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noreferrer"
          onClick={() => audioHaptics.playTap()}
          className="w-full bg-white text-green-700 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Chat on WhatsApp Now</span>
        </a>
      </div>

      {/* Phone Call Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e22e28] flex items-center justify-center font-bold">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-sm text-gray-900">Direct Phone Helpline</h3>
            <p className="text-xs text-gray-500 font-bold">+91 98765 43210</p>
          </div>
        </div>

        <a
          href="tel:+919876543210"
          onClick={() => audioHaptics.playTap()}
          className="bg-[#e22e28] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all"
        >
          Call Now
        </a>
      </div>

      {/* Common FAQs */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">
          Frequently Asked Questions
        </h3>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden text-left">
          {[
            {
              q: 'How long does withdrawal processing take?',
              a: 'Withdrawal requests are processed between 10:00 AM and 08:00 PM IST daily. Typical turnaround is 15 to 45 minutes.',
            },
            {
              q: 'How do I deposit funds via UPI?',
              a: 'Go to Wallet > Add Money, copy our official verified UPI ID, transfer via PhonePe/GPay/Paytm, and enter the 12-digit UTR reference number.',
            },
            {
              q: 'What is the minimum deposit and withdrawal?',
              a: 'Minimum deposit is ₹100, and minimum withdrawal is ₹500.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-4 space-y-1">
              <h4 className="font-bold text-sm text-gray-900">{faq.q}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
