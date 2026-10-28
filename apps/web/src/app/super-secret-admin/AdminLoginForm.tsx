'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert } from 'lucide-react';
import { loginAdmin } from '../actions/admin';

export default function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await loginAdmin(password);
      if (res.success) {
        router.push('/super-secret-admin/dashboard');
        router.refresh();
      } else {
        setError(res.error || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-100 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-[0_20px_60px_rgba(228,46,42,0.1)] overflow-hidden relative z-10">
        <div className="p-8">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-[#e42e2a]" />
          </div>
          
          <h1 className="text-2xl font-black text-center text-gray-900 mb-2 tracking-tight">Admin Override</h1>
          <p className="text-gray-500 text-sm text-center mb-8">Enter the master password to access your dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e42e2a]/50 focus:border-[#e42e2a] transition-all font-mono tracking-widest text-lg"
                  placeholder="••••••••"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-500 font-bold text-center">{error}</p>}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#e42e2a] hover:bg-[#d02522] active:bg-[#b81d1b] text-white font-bold rounded-xl shadow-[0_5px_15px_rgba(228,46,42,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
        </div>
        
        <div className="py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Secure Gateway</p>
        </div>
      </div>
    </div>
  );
}
