'use client';

import React, { useState } from 'react';
import { requestOtpAction, verifyOtpAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [phone, setPhone] = useState('9380347013');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRequestOtp = async () => {
    setError('');
    const res = await requestOtpAction('+91' + phone);
    if (res.success) {
      setStep('OTP');
    } else {
      setError(res.message);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const res = await verifyOtpAction('+91' + phone, otp);
    if (res.success) {
      // Hard refresh to admin panel
      window.location.href = '/admin';
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-black text-center mb-6 text-red-600">Admin Login</h2>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        {step === 'PHONE' ? (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4 font-mono"
            />
            <button onClick={handleRequestOtp} className="w-full bg-red-600 text-white font-bold py-2 rounded">
              Request OTP
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Enter OTP</label>
            <input 
              type="text" 
              value={otp} 
              onChange={e => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4 font-mono text-center tracking-widest text-lg"
              placeholder="123456"
              maxLength={6}
            />
            <button onClick={handleVerifyOtp} className="w-full bg-red-600 text-white font-bold py-2 rounded">
              Verify & Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
