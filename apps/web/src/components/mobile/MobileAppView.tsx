'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Bell, 
  ChevronRight, 
  Play, 
  Wallet, 
  HelpCircle, 
  Info,
  Phone, 
  MessageCircle, 
  TrendingUp, 
  History, 
  FileText, 
  Home, 
  Headphones, 
  User, 
  Lock, 
  BarChart2, 
  Lightbulb, 
  Star, 
  Shield, 
  AlertTriangle, 
  Settings, 
  Share2, 
  Moon, 
  Sun,
  LogOut,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';
import { getLiveHomepageData } from '@/app/actions/homepage';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  result: string;
  isSpecial: boolean;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface MobileAppViewProps {
  initialMainGames: GameItem[];
  initialStarlineGames: GameItem[];
  initialJackpotGames: GameItem[];
}

export default function MobileAppView({
  initialMainGames,
  initialStarlineGames,
  initialJackpotGames,
}: MobileAppViewProps) {
  const router = useRouter();
  const { user, wallet, isAuthenticated, logout, showToast, requestOtp, verifyOtp, setupMpin, loginWithMpin, activeOtpCode } = useApp();

  // App Navigation & Drawer State
  const [activeTab, setActiveTab] = useState<'main' | 'starline'>('main');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentBottomTab, setCurrentBottomTab] = useState<'home' | 'history' | 'passbook' | 'funds' | 'support'>('home');

  // Multi-step Flow State for unauthenticated / MPIN users
  // 'splash' -> 'phone' -> 'otp' -> 'set_mpin' -> 'mpin_login' -> 'dashboard'
  const [appScreen, setAppScreen] = useState<'splash' | 'phone' | 'otp' | 'set_mpin' | 'mpin_login' | 'dashboard'>('splash');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedScreenCode, setGeneratedScreenCode] = useState('');
  const [mpinInput, setMpinInput] = useState('');
  const [confirmMpinInput, setConfirmMpinInput] = useState('');
  const [loginMpinInput, setLoginMpinInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Live Games Feed
  const [mainGames, setMainGames] = useState<GameItem[]>(initialMainGames);
  const [starlineGames, setStarlineGames] = useState<GameItem[]>(initialStarlineGames);
  const [jackpotGames, setJackpotGames] = useState<GameItem[]>(initialJackpotGames);

  // Real-time polling for market results and play buttons (smart 10s sync)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const fresh = await getLiveHomepageData();
        if (fresh) {
          setMainGames(fresh.mainGames);
          setStarlineGames(fresh.starlineGames);
          setJackpotGames(fresh.jackpotGames);
        }
      } catch (err) {}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Screen 1: Splash screen timer & smart router
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (!user.hasMpin) {
          setAppScreen('set_mpin');
        } else {
          // Check if previously locked with MPIN
          const isMpinUnlocked = sessionStorage.getItem('mantri_mpin_unlocked') || sessionStorage.getItem('lucky_mpin_unlocked');
          if (isMpinUnlocked === 'true') {
            setAppScreen('dashboard');
          } else {
            setAppScreen('mpin_login');
          }
        }
      } else {
        setAppScreen('phone');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Auth Step 1: Request Security Verification Code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length !== 10) {
      showToast('error', 'Invalid Phone', 'Please enter a valid 10-digit mobile number');
      return;
    }
    setAuthLoading(true);
    const res = await requestOtp(phoneInput);
    setAuthLoading(false);
    if (res.success) {
      if ((res as any).requiresMpin) {
        setLoginMpinInput('');
        setAppScreen('mpin_login');
        return;
      }
      const code = (res as any).code || '';
      if (code) {
        setGeneratedScreenCode(code);
      }
      setAppScreen('otp');
    } else {
      showToast('error', 'Error', res.message || 'Failed to generate verification code');
    }
  };

  // Auth Step 2: Verify Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length < 4) {
      showToast('error', 'Invalid Code', 'Please enter the verification code');
      return;
    }
    setAuthLoading(true);
    const res = await verifyOtp(phoneInput, otpInput);
    setAuthLoading(false);
    if (res.success) {
      if (res.requiresMpin) {
        setAppScreen('set_mpin');
      } else {
        sessionStorage.setItem('mantri_mpin_unlocked', 'true');
        setAppScreen('dashboard');
      }
    } else {
      showToast('error', 'Verification Failed', 'Incorrect code. Please enter the code shown on your screen.');
    }
  };

  // Auth Step 3: Set MPIN
  const handleSaveMpin = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (mpinInput.length !== 4) {
      showToast('error', 'Invalid MPIN', 'MPIN must be 4 digits');
      return;
    }
    if (mpinInput !== confirmMpinInput) {
      showToast('error', 'Mismatch', 'Both MPINs must match');
      return;
    }
    setAuthLoading(true);
    const res = await setupMpin(mpinInput);
    setAuthLoading(false);
    if (res.success) {
      sessionStorage.setItem('mantri_mpin_unlocked', 'true');
      setAppScreen('dashboard');
      showToast('success', 'Success', 'MPIN setup completed!');
    } else {
      showToast('error', 'Setup Failed', 'Could not save MPIN. Please try again.');
    }
  };

  // Auth Step 3B: MPIN Unlock
  const handleMpinLogin = async (digit: string) => {
    if (loginMpinInput.length >= 4) return;
    const nextVal = loginMpinInput + digit;
    setLoginMpinInput(nextVal);
    audioHaptics.playTap();

    if (nextVal.length === 4) {
      setAuthLoading(true);
      const phoneToUse = user?.phone || phoneInput;
      const res = await loginWithMpin(phoneToUse, nextVal);
      setAuthLoading(false);
      if (res.success) {
        sessionStorage.setItem('mantri_mpin_unlocked', 'true');
        setAppScreen('dashboard');
        showToast('success', 'Welcome', 'Login successful');
      } else {
        showToast('error', 'Invalid MPIN', 'Incorrect 4-digit MPIN. Try again.');
        setLoginMpinInput('');
      }
    }
  };

  // --------------------------------------------------------------------------
  // SCREEN 1: SPLASH SCREEN
  // --------------------------------------------------------------------------
  if (appScreen === 'splash') {
    return (
      <div className="fixed inset-0 z-50 bg-[#fff5f5] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-24 h-24 rounded-3xl bg-[#e22e28] flex items-center justify-center shadow-xl shadow-red-500/20 mb-6 animate-pulse">
          <span className="font-black text-white text-5xl italic tracking-tighter">M</span>
        </div>
        <h1 className="text-3xl font-black text-[#e22e28] italic tracking-tight mb-2">MANTRI777</h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">India's #1 Trusted Matka Platform</p>
        <div className="mt-12 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#e22e28] animate-bounce"></span>
          <span className="w-2 h-2 rounded-full bg-[#e22e28] animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-2 h-2 rounded-full bg-[#e22e28] animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: PHONE & OTP LOGIN
  // --------------------------------------------------------------------------
  if (appScreen === 'phone' || appScreen === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff5f5] via-white to-[#fff0f0] flex flex-col justify-between p-6 select-none">
        <div className="pt-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#e22e28] flex items-center justify-center shadow-lg shadow-red-500/20 mb-4">
            <span className="font-black text-white text-3xl italic">M</span>
          </div>
          <h2 className="text-2xl font-black text-[#111] italic tracking-tight">MANTRI777</h2>
          <p className="text-xs text-gray-500 mt-1">Play Big • Win Big • 100% Instant Payouts</p>
        </div>

        <div className="w-full max-w-sm mx-auto bg-white p-6 rounded-3xl border border-red-100 shadow-xl shadow-red-500/5 my-auto">
          {appScreen === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-black text-gray-900">Instant Login</h3>
                <p className="text-xs text-gray-500 mt-1">Enter your 10-digit mobile number to proceed</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Mobile Number</label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#e22e28] px-3.5 py-3 bg-gray-50/50 transition-colors">
                  <span className="text-sm font-black text-gray-700 mr-2 border-r border-gray-300 pr-2">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent text-gray-900 font-bold text-base focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phoneInput.length !== 10 || authLoading}
                className="w-full py-3.5 rounded-2xl bg-[#e22e28] hover:bg-[#c92424] active:scale-[0.98] transition-all text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {authLoading ? 'Generating Code...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-3">
                <h3 className="text-lg font-black text-gray-900">Security Verification</h3>
                <p className="text-xs text-gray-500 mt-0.5">Phone: +91 {phoneInput}</p>
              </div>

              {/* Unique On-Screen Security Code Display */}
              <div className="bg-gradient-to-br from-red-50 via-white to-red-50/40 border-2 border-red-200 rounded-2xl p-4 text-center shadow-sm relative overflow-hidden">
                <div className="text-[10px] font-black text-[#e22e28] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e22e28] animate-ping" />
                  Your Verification Code
                </div>
                <div className="flex items-center justify-center py-1">
                  <span className="font-mono text-3xl font-black text-gray-900 tracking-[0.3em] pl-3 select-all bg-white px-4 py-1.5 rounded-xl border border-red-100 shadow-inner">
                    {generatedScreenCode || activeOtpCode || '••••'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">
                  Enter the code above to verify your session
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter Code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.3em] text-2xl font-black rounded-2xl border-2 border-gray-200 focus:border-[#e22e28] py-3 bg-gray-50/50 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* 1-Tap Quick Auto-fill button */}
              {(generatedScreenCode || activeOtpCode) && (
                <button
                  type="button"
                  onClick={() => {
                    const c = generatedScreenCode || activeOtpCode || '';
                    setOtpInput(c);
                    audioHaptics.playTap();
                  }}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-[#e22e28] rounded-xl text-xs font-black tracking-wide transition-all border border-red-200/60 flex items-center justify-center gap-1.5"
                >
                  <span>⚡ 1-Tap Auto-Fill ({generatedScreenCode || activeOtpCode})</span>
                </button>
              )}

              <button
                type="submit"
                disabled={otpInput.length < 4 || authLoading}
                className="w-full py-3.5 rounded-2xl bg-[#e22e28] hover:bg-[#c92424] active:scale-[0.98] transition-all text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:pointer-events-none"
              >
                {authLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setAppScreen('phone')}
                className="w-full text-xs font-bold text-gray-500 hover:text-[#e22e28] text-center pt-1"
              >
                Change mobile number
              </button>
            </form>
          )}
        </div>

        <div className="text-center pb-4 text-[11px] font-bold text-gray-400">
          Version 1.0.5 • Secure 256-bit Encrypted
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 3: SET MPIN
  // --------------------------------------------------------------------------
  if (appScreen === 'set_mpin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff5f5] to-white flex flex-col justify-between p-6 select-none">
        <div className="pt-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#e22e28] flex items-center justify-center shadow-lg shadow-red-500/20 mb-4">
            <span className="font-black text-white text-3xl italic">M</span>
          </div>
          <h2 className="text-2xl font-black text-[#111]">Set 4-Digit MPIN</h2>
          <p className="text-xs text-gray-500 mt-1">Set a 4-digit PIN for quick 1-tap app unlock</p>
        </div>

        <form onSubmit={handleSaveMpin} className="w-full max-w-sm mx-auto bg-white p-6 rounded-3xl border border-red-100 shadow-xl my-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Enter 4-Digit MPIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="• • • •"
              value={mpinInput}
              onChange={(e) => setMpinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-xl font-black rounded-2xl border-2 border-gray-200 focus:border-[#e22e28] py-2.5 bg-gray-50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Confirm MPIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="• • • •"
              value={confirmMpinInput}
              onChange={(e) => setConfirmMpinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-xl font-black rounded-2xl border-2 border-gray-200 focus:border-[#e22e28] py-2.5 bg-gray-50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={mpinInput.length !== 4 || confirmMpinInput.length !== 4 || authLoading}
            className="w-full py-3.5 rounded-2xl bg-[#e22e28] hover:bg-[#c92424] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 disabled:opacity-50"
          >
            {authLoading ? 'Saving...' : 'Set MPIN & Enter'}
          </button>
        </form>

        <div className="text-center pb-4 text-[11px] font-bold text-gray-400">
          Version 1.0.5
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 3B: MPIN LOGIN (Matching Screenshot 3)
  // --------------------------------------------------------------------------
  if (appScreen === 'mpin_login') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fceeee] via-[#fdf7f7] to-[#fae8e8] flex flex-col justify-between p-6 select-none">
        <div className="pt-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#e22e28] flex items-center justify-center shadow-lg shadow-red-500/25 mb-4">
            <span className="font-black text-white text-3xl italic">M</span>
          </div>
          <h2 className="text-2xl font-black text-[#111]">MPIN Login</h2>
          <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
            Please enter your 4-digit MPIN to login to your account.
          </p>

          {/* 4 White Dots Boxes */}
          <div className="flex gap-4 mt-8">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = loginMpinInput.length > idx;
              return (
                <div
                  key={idx}
                  className="w-14 h-14 bg-white rounded-2xl border border-red-100 shadow-md flex items-center justify-center"
                >
                  <span className={`w-3.5 h-3.5 rounded-full transition-all ${hasDigit ? 'bg-gray-400 scale-100' : 'bg-transparent scale-50'}`} />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                const targetPhone = user?.phone || phoneInput;
                const msg = encodeURIComponent(`Hello Mantri777 Support, I forgot my 4-digit MPIN for my registered mobile number +91 ${targetPhone}. Please help me reset it.`);
                window.open(`https://wa.me/919380347013?text=${msg}`, '_blank');
              }}
              className="text-xs font-black text-[#e22e28] hover:underline"
            >
              Forgot MPIN? Reset via WhatsApp
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => {
                setLoginMpinInput('');
                setAppScreen('phone');
              }}
              className="text-xs font-bold text-gray-500 hover:text-gray-900"
            >
              Change Number
            </button>
          </div>
        </div>

        {/* Numeric keypad */}
        <div className="w-full max-w-xs mx-auto pb-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (k === '⌫') {
                    audioHaptics.playTap();
                    setLoginMpinInput((prev) => prev.slice(0, -1));
                  } else if (k) {
                    handleMpinLogin(k);
                  }
                }}
                disabled={!k}
                className={`h-14 rounded-2xl font-black text-xl flex items-center justify-center transition-all ${
                  k ? 'bg-white shadow-sm active:bg-gray-100 text-gray-800' : 'opacity-0 pointer-events-none'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="text-center text-[11px] font-bold text-gray-400">
            Version 1.0.5
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 4: MARKET & SLIDE DASHBOARD (Matching Screenshot 1 & 2)
  // --------------------------------------------------------------------------
  const displayedGames = mainGames;

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-gray-950 text-white' : 'bg-[#fff5f5] text-gray-900'} select-none relative overflow-x-hidden`}>
      
      {/* 1. TOP APP BAR */}
      <header className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-red-50'} shadow-sm`}>
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Icon */}
          <button
            onClick={() => {
              audioHaptics.playTap();
              setDrawerOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-700 active:scale-95 transition-transform"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Badge */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#e22e28] flex items-center justify-center shadow-sm">
              <span className="font-black text-white text-base italic">M</span>
            </div>
            <span className="font-black text-xl italic tracking-tight text-[#e22e28]">MANTRI777</span>
          </div>

          {(user?.role === 'ADMIN' || user?.phone === '8296832413') && (
            <Link
              href="/super-secret-admin/dashboard"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white font-black text-[10px] tracking-wider shadow-sm active:scale-95 transition-transform"
            >
              <Shield className="w-3 h-3" />
              <span>ADMIN</span>
            </Link>
          )}
        </div>

        {/* Right: Wallet Balance Pill + Bell Icon */}
        <div className="flex items-center gap-2">
          <Link
            href="/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:border-red-200 active:scale-95 transition-transform shadow-xs"
          >
            <span className="w-4 h-4 rounded-full bg-[#e22e28] text-white flex items-center justify-center text-[10px] font-bold">₹</span>
            <span className="font-black text-xs text-gray-900">
              {wallet ? wallet.totalBalance.toFixed(2) : '0.00'}
            </span>
          </Link>

          <Link
            href="/notifications"
            className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 relative active:scale-95 transition-transform"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#e22e28] absolute top-2 right-2 ring-2 ring-white"></span>
          </Link>
        </div>
      </header>

      {/* 2. ANNOUNCEMENT TICKER */}
      <div className="bg-white/80 border-b border-red-100 px-3 py-2 flex items-center gap-2 overflow-hidden shadow-2xs">
        <span className="text-base">📢</span>
        <div className="marquee-wrapper overflow-hidden whitespace-nowrap flex-1">
          <p className="text-xs font-bold text-gray-700 animate-marquee inline-block">
            Welcome to the Mantri777 family 🎉 Play big. Win big. 100% Guaranteed instant withdrawals within 5 minutes!
          </p>
        </div>
      </div>

      {/* 3. QUICK ACTION CIRCLES (4 Grid) */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-red-50 grid grid-cols-4 gap-2 text-center">
          <Link href="/wallet/add-money" className="flex flex-col items-center group active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-[#e22e28] text-white flex items-center justify-center shadow-md shadow-red-500/20 mb-1.5 group-hover:bg-[#c92424]">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-800">Deposit</span>
          </Link>

          <Link href="/wallet/withdraw" className="flex flex-col items-center group active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-[#e22e28] text-white flex items-center justify-center shadow-md shadow-red-500/20 mb-1.5 group-hover:bg-[#c92424]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-800">Withdraw</span>
          </Link>

          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex flex-col items-center group active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-[#e22e28] text-white flex items-center justify-center shadow-md shadow-red-500/20 mb-1.5 group-hover:bg-[#c92424]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-800">WhatsApp</span>
          </a>

          <a href="tel:+919876543210" className="flex flex-col items-center group active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-[#e22e28] text-white flex items-center justify-center shadow-md shadow-red-500/20 mb-1.5 group-hover:bg-[#c92424]">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-800">Call Us</span>
          </a>
        </div>
      </div>

      {/* 4. SECTION HEADER */}
      <div className="px-4 pb-1 pt-1 flex items-center justify-between">
        <h3 className="font-black text-sm text-gray-900 tracking-tight">Live Markets</h3>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Sync</span>
        </div>
      </div>

      {/* 5. MARKET CARDS (Matching Screenshot 1) */}
      <div className="px-4 py-2 space-y-3">
        {displayedGames.map((market) => (
          <div
            key={market.id}
            className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs flex flex-col space-y-3"
          >
            {/* Header: Market Name + Play Button */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-base font-black text-[#e22e28] tracking-wide uppercase">{market.name}</h3>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="text-xl font-black text-gray-900 tracking-widest mt-1">
                  {market.result}
                </div>
              </div>

              {market.isOpen ? (
                <Link
                  href={`/markets/${market.slug}/play`}
                  className="bg-[#e22e28] hover:bg-[#c92424] text-white px-5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-white px-5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 opacity-80 cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play
                </button>
              )}
            </div>

            {/* Bottom Meta: Open Bids / Close Bids + Status */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600">
              <div className="space-y-0.5">
                <div>Open Bids: <span className="text-gray-900">{market.openTime || '09:00 AM'}</span></div>
                <div>Close Bids: <span className="text-gray-900">{market.closeTime || '12:00 PM'}</span></div>
              </div>

              <span className={`font-black ${market.isOpen ? 'text-green-600' : 'text-[#e22e28]'}`}>
                {market.isOpen ? 'Market Running' : 'Closed for Today'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 6. SLIDE-OUT DRAWER MENU (Matching Screenshot 2) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#e22e28] flex items-center justify-center text-white font-black italic">M</div>
                  <span className="font-black text-xl italic text-[#e22e28]">MANTRI777</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Snippet */}
              <div className="p-4 flex items-center gap-3 border-b border-gray-100 bg-gray-50/50">
                <div className="w-12 h-12 rounded-full bg-[#f87171] text-white flex items-center justify-center font-black text-base uppercase">
                  {user?.displayName ? user.displayName.slice(0, 2) : 'RA'}
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-900">{user?.displayName || 'Ravichandra'}</h4>
                  <p className="text-xs text-gray-500 font-bold">{user?.phone ? `+91 ${user.phone}` : '+91 6366798974'}</p>
                </div>
              </div>

              {/* Super Admin Access Card for 8296832413 */}
              {(user?.role === 'ADMIN' || user?.phone === '8296832413') && (
                <div className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-red-500/10 to-amber-500/5 border border-amber-300 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">👑</span>
                      <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider">Super Admin</span>
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white">Full Access</span>
                  </div>
                  <p className="text-[10px] text-gray-600 mb-2 leading-tight">Declare game results, manage user balances & payouts without passwords.</p>
                  <Link
                    href="/super-secret-admin/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#e22e28] to-amber-600 text-white font-black text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Open Super Admin</span>
                  </Link>
                </div>
              )}

              {/* Menu List */}
              <div className="py-2 divide-y divide-gray-50 text-sm font-bold text-gray-700">
                {[
                  ...((user?.role === 'ADMIN' || user?.phone === '8296832413') ? [{ icon: Shield, label: '👑 Admin Dashboard', href: '/super-secret-admin/dashboard' }] : []),
                  { icon: User, label: 'My Profile', href: '/profile' },
                  { icon: Lock, label: 'Change MPIN', href: '/setup-mpin' },
                  { icon: BarChart2, label: 'Charts', href: '/chart/jodi/kalyan' },
                  { icon: Bell, label: 'Notifications', href: '/notifications' },
                  { icon: HelpCircle, label: 'How to Play', href: '/welcome' },
                  { icon: Lightbulb, label: "User's Idea", href: '/support' },
                  { icon: Star, label: 'Games Rates', href: '/rates' },
                  { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
                  { icon: AlertTriangle, label: 'Terms & Conditions', href: '/terms' },
                  { icon: Settings, label: 'Setting', href: '/settings' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'Mantri777', text: 'Play Matka on Mantri777', url: window.location.origin });
                    }
                  }}
                  className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50 text-left"
                >
                  <Share2 className="w-5 h-5 text-gray-500" />
                  <span>Share Application</span>
                </button>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3.5">
                    <Moon className="w-5 h-5 text-gray-500" />
                    <span>Dark Mode</span>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${darkMode ? 'bg-[#e22e28]' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-bold">
              <span>App Version 1.0.5</span>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setAppScreen('phone');
                    setDrawerOpen(false);
                  }}
                  className="text-red-500 flex items-center gap-1 font-black"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. BOTTOM APP NAVIGATION (5 Tabs - Matching Screenshot 1) */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 h-16 border-t flex items-center justify-around px-2 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        {[
          { key: 'history', label: 'History', icon: History, href: '/bets' },
          { key: 'passbook', label: 'Passbook', icon: FileText, href: '/passbook' },
          { key: 'home', label: 'Home', icon: Home, href: '/' },
          { key: 'funds', label: 'Funds', icon: Wallet, href: '/wallet' },
          { key: 'support', label: 'Support', icon: Headphones, href: '/support' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentBottomTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              onClick={() => {
                audioHaptics.playTap();
                setCurrentBottomTab(tab.key as any);
              }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center"
            >
              <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'text-[#e22e28]' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e22e28] absolute -bottom-1 left-1/2 -translate-x-1/2"></span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-[#e22e28]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
