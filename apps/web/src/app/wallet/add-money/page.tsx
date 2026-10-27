'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  Copy, 
  Check, 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  CreditCard,
  History,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { audioHaptics } from '@/lib/audio-haptics';
import { getPublicSettings } from '../../actions/settings';
import { getUserPaymentDetailsAction } from '../../actions/wallet';

function generateOrderRef() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `M777-${timestamp}-${randomPart}`;
}

export default function AddMoneyPage() {
  const router = useRouter();
  const { wallet, addMoney } = useApp();
  
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [utr, setUtr] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Settings & user details
  const [settings, setSettings] = useState<any>(null);
  const [userPayment, setUserPayment] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [showQr, setShowQr] = useState(true);

  // Dynamic unique order ref and session timer (15 minutes)
  const [orderRef, setOrderRef] = useState<string>(() => generateOrderRef());
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins in seconds

  // Post-submit success screen state
  const [submittedDeposit, setSubmittedDeposit] = useState<{
    amount: number;
    utr: string;
    orderRef: string;
    status: string;
    message: string;
  } | null>(null);

  const activeAmount = customAmount ? parseInt(customAmount) || 0 : amount;
  const minDeposit = settings?.minDepositAmount || 100;

  useEffect(() => {
    getPublicSettings().then(res => {
      setSettings(res);
      if (res.minDepositAmount && res.minDepositAmount > 500) {
        setAmount(res.minDepositAmount);
      }
    });

    getUserPaymentDetailsAction().then(res => {
      if (res.success && res.details) {
        setUserPayment(res.details);
      }
    });
  }, []);

  // Countdown timer for dynamic order session
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-refresh order ref on expiry
      setOrderRef(generateOrderRef());
      setTimeLeft(900);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCopyUpi = () => {
    if (!settings?.ownerUpiId) return;
    navigator.clipboard.writeText(settings.ownerUpiId);
    setCopiedUpi(true);
    audioHaptics.playTap();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyOrderRef = () => {
    navigator.clipboard.writeText(orderRef);
    setCopiedOrder(true);
    audioHaptics.playTap();
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleRegenerateQr = () => {
    setOrderRef(generateOrderRef());
    setTimeLeft(900);
    audioHaptics.playTap();
  };

  const handleDeposit = async () => {
    setErrorMsg(null);
    if (activeAmount < minDeposit) {
      setErrorMsg(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }
    
    const cleanUtr = utr.trim().toUpperCase();
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMsg('Please enter a valid 12-digit UPI UTR reference number.');
      return;
    }

    setLoading(true);
    try {
      const res = await addMoney(activeAmount, cleanUtr, settings?.ownerUpiId);
      setLoading(false);

      if (res.success) {
        audioHaptics.playSuccess();
        setSubmittedDeposit({
          amount: activeAmount,
          utr: cleanUtr,
          orderRef: orderRef,
          status: 'PENDING VERIFICATION',
          message: 'Your payment reference has been submitted. Our banking verification system is processing your confirmation.'
        });
      } else {
        audioHaptics.playError();
        setErrorMsg(res.message || 'Failed to submit deposit request');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    }
  };

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#e42e2a]/20 border-t-[#e42e2a] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!settings.depositEnabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 min-h-screen text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#e42e2a] flex items-center justify-center border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Deposits Temporarily Offline</h2>
        <p className="text-sm text-gray-500 font-medium max-w-xs">
          The payment gateway is undergoing scheduled routine maintenance. Please check back shortly.
        </p>
        <button 
          onClick={() => router.push('/wallet')} 
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm mt-4"
        >
          Return to Wallet
        </button>
      </div>
    );
  }

  // Format timer MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Generate dynamic unique UPI intent with order reference & note
  const upiIntent = `upi://pay?pa=${settings.ownerUpiId}&pn=${encodeURIComponent('Mantri777 Official')}&am=${activeAmount}&cu=INR&tr=${orderRef}&tn=${encodeURIComponent(`Deposit ${orderRef}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(upiIntent)}`;

  // SUCCESS / PENDING STATUS SCREEN
  if (submittedDeposit) {
    return (
      <div className="flex-1 flex flex-col justify-between p-4 pb-24 bg-gray-50 min-h-screen">
        <div className="space-y-6 pt-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-200 shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Deposit Submitted!</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mt-2 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Status: {submittedDeposit.status}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 font-medium leading-relaxed px-2">
              {submittedDeposit.message}
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold uppercase">Requested Amount:</span>
                <span className="font-black text-lg text-gray-900">₹{submittedDeposit.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold uppercase">Order Reference:</span>
                <span className="font-mono font-bold text-gray-900">{submittedDeposit.orderRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold uppercase">UTR Reference:</span>
                <span className="font-mono font-bold text-gray-900">{submittedDeposit.utr}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200/50">
                <span className="text-gray-500 font-bold uppercase">Wallet Balance:</span>
                <span className="font-black text-gray-600">Unchanged (₹{wallet.cashBalance.toLocaleString()})</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 font-medium text-left">
              <strong>What happens next?</strong> Banking network verification typically takes 2–10 minutes. ₹{submittedDeposit.amount} will be credited automatically to your playable balance.
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-6">
          <Link
            href="/wallet/history"
            className="w-full bg-[#e42e2a] hover:bg-red-700 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-md transition-colors"
          >
            <History className="w-4 h-4" />
            <span>View Deposit History</span>
          </Link>

          <Link
            href="/wallet"
            className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 py-3 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Return to Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pb-24 bg-gray-50 min-h-screen space-y-4">
      <div className="space-y-5">
        {/* Header */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.back()} 
                className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Deposit Funds (UPI)
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium pl-6">
              Scan dynamic QR or use UPI ID, then submit your 12-digit UTR reference.
            </p>
          </div>

          <Link
            href="/wallet/history"
            className="text-xs font-bold text-[#e42e2a] bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </Link>
        </div>

        {/* Current Balance Pill */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">Playable Cash</span>
            <span className="text-xl font-black text-gray-900">₹{wallet.cashBalance.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Min Deposit</span>
            <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
              ₹{minDeposit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Amount Presets */}
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-700 uppercase tracking-wider">Select Deposit Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  audioHaptics.playChip();
                  setAmount(amt);
                  setCustomAmount('');
                  setErrorMsg(null);
                }}
                className={`py-3 rounded-xl text-xs font-black border transition-all ${
                  amount === amt && !customAmount
                    ? 'bg-red-50 text-[#e42e2a] border-[#e42e2a] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-base">₹</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder={`Custom amount (min ₹${minDeposit})`}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value.replace(/\D/g, ''));
                setErrorMsg(null);
              }}
              className="w-full bg-white text-gray-900 placeholder-gray-400 pl-9 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {/* Payment Gateway Box */}
        {!settings?.ownerUpiId ? (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">Deposit Channel Offline</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                No receiving UPI channel is currently active. The administration is setting up payment channels.
              </p>
            </div>
            {settings?.supportNumber && (
              <a
                href={`https://wa.me/${settings.supportNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <span>Contact WhatsApp Support</span>
              </a>
            )}
          </div>
        ) : (
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Receiving Gateway</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-black text-gray-900">Mantri777 Official Gateway</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
            </button>
          </div>

          {/* Dynamic Order Reference Session Pill */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-3 border border-red-100 flex items-center justify-between gap-2">
            <div className="truncate">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#e42e2a]" />
                <span>Dynamic Session Ref</span>
              </div>
              <span className="font-mono font-black text-xs text-gray-900 tracking-wider">
                {orderRef}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                ⏳ {formattedTime}
              </span>
              <button
                type="button"
                onClick={handleRegenerateQr}
                title="Generate new QR code"
                className="p-1.5 text-gray-500 hover:text-gray-900 bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* UPI Copy Box */}
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Official Gateway UPI ID</span>
              <span className="font-mono font-black text-sm text-blue-700 tracking-wide select-all">
                {settings.ownerUpiId}
              </span>
            </div>
            <button
              onClick={handleCopyUpi}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
            >
              {copiedUpi ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Dynamic Unique QR Code */}
          {showQr && (
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-gray-100 space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm relative">
                <img 
                  src={qrCodeUrl} 
                  alt="Unique Dynamic UPI QR Code" 
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-black text-gray-900">
                  Scan to Pay <span className="text-[#e42e2a]">₹{activeAmount.toLocaleString()}</span>
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  Compatible with PhonePe, Google Pay, Paytm, BHIM & CRED
                </p>
              </div>

              {/* Direct UPI App intent trigger for mobile users */}
              <a
                href={upiIntent}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-[0.98]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open & Pay in UPI App</span>
              </a>
            </div>
          )}

          {/* User Saved Payment Details Preview */}
          {userPayment && (userPayment.upiId || userPayment.bankAccountNumber) && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-gray-500 font-bold uppercase text-[10px]">
                <span>Your Linked Payout Info:</span>
                <Link href="/payment-setup" className="text-[#e42e2a] hover:underline font-bold">Edit</Link>
              </div>
              <div className="text-gray-800 font-medium truncate">
                {userPayment.upiId && <span>UPI: <strong className="font-mono">{userPayment.upiId}</strong></span>}
                {userPayment.bankAccountNumber && (
                  <span className="ml-2">Bank: <strong className="font-mono">•••• {userPayment.bankAccountNumber.slice(-4)}</strong></span>
                )}
              </div>
            </div>
          )}

          {/* Verification steps */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs space-y-2 text-amber-950">
            <h4 className="font-black text-amber-900 uppercase tracking-wider text-[11px]">
              How to Complete Your Deposit:
            </h4>
            <ol className="space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
              <li>Scan the dynamic QR code above or pay to <strong>{settings.ownerUpiId}</strong>.</li>
              <li>Complete the payment of <strong>₹{activeAmount.toLocaleString()}</strong> in your UPI app.</li>
              <li>Copy the <strong>12-digit UTR / Banking Reference Number</strong> from your payment receipt.</li>
              <li>Paste the UTR number in the field below.</li>
              <li>Click <strong>Submit Deposit Request</strong> to complete verification.</li>
              <li>Your wallet balance will update automatically upon banking settlement.</li>
            </ol>
          </div>
        </div>
        )}

        {/* UTR Input Field */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span>Enter 12-Digit UTR Reference No.</span>
            <span className="text-[10px] text-gray-400 font-normal">Banking Ref</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 428190348210"
            value={utr}
            onChange={(e) => {
              setUtr(e.target.value.toUpperCase());
              setErrorMsg(null);
            }}
            className="w-full bg-white text-gray-900 placeholder-gray-400 px-5 py-4 rounded-xl border border-gray-200 focus:border-[#e42e2a] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-base font-black shadow-sm font-mono tracking-widest uppercase"
          />
          <p className="text-[11px] text-gray-500 font-medium">
            Find the 12-digit UTR in PhonePe, GPay, or Paytm under transaction details.
          </p>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="space-y-3 pt-4">
        <button
          onClick={handleDeposit}
          disabled={activeAmount < minDeposit || !utr.trim() || loading}
          className="w-full bg-[#e42e2a] hover:bg-red-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-black transition-all uppercase tracking-wider active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Deposit Request</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
          <span>Banking verification required before balance release. 256-bit SSL secured.</span>
        </div>
      </div>
    </div>
  );
}
