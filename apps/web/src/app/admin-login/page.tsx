'use client';

import React, { useState } from 'react';
import { requestOtpAction, verifyOtpAction } from '@/app/actions/auth';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const [phone, setPhone] = useState('9380347013');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    setError('');
    const res = await requestOtpAction(phone);
    if (res.success) {
      setStep('OTP');
    } else {
      setError(res.message);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const res = await verifyOtpAction(phone, otp);
    if (res.success) {
      // Hard refresh to admin panel
      window.location.href = '/admin';
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15)_0%,transparent_50%)] pointer-events-none"></div>
      
      <div className="bg-surface-card p-8 rounded-2xl border border-surface-border shadow-2xl w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center mb-4 shadow-glow-gold relative overflow-hidden">
            <div className="absolute inset-0 bg-gold-500/10"></div>
            <Shield className="w-8 h-8 text-gold-500 relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-center text-gray-100 tracking-wide">ADMIN LOGIN</h2>
          <p className="text-sm text-gray-400 mt-1">Authorized personnel only</p>
        </div>
        
        {error && (
          <div className="mb-6 text-sm text-crimson-400 bg-crimson-500/10 border border-crimson-500/20 p-3 rounded-lg font-medium text-center">
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">+91</span>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border text-gray-100 rounded-xl py-3 pl-14 pr-4 font-mono focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                  placeholder="Enter 10 digit number"
                />
              </div>
            </div>
            <button 
              onClick={handleRequestOtp} 
              className="w-full bg-gold-500 hover:bg-gold-400 text-surface-card font-black py-3.5 rounded-xl transition-all shadow-glow-gold flex items-center justify-center gap-2"
            >
              Request OTP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Enter OTP</label>
              <input 
                type="text" 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border text-gold-accent rounded-xl py-4 font-mono text-center tracking-[1em] text-xl focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                placeholder="------"
                maxLength={6}
              />
            </div>
            <button 
              onClick={handleVerifyOtp} 
              className="w-full bg-gold-500 hover:bg-gold-400 text-surface-card font-black py-3.5 rounded-xl transition-all shadow-glow-gold"
            >
              Verify & Login
            </button>
            <button 
              onClick={() => {setStep('PHONE'); setOtp(''); setError('');}}
              className="w-full text-sm text-gray-500 hover:text-gray-300 font-semibold py-2 transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
