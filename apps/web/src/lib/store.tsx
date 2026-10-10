'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BetTypeRule, PlaceBetRequest, SupportTicket, NotificationItem, ResultWorkflowStatus, ResultEntry, BalanceType, TransactionStatus, TransactionType, TransactionRecord, WalletBalance, BetStatus, BetItem, BetTypeCode, MarketStatus, Market, UserStatus, UserRole, UserProfile } from '@zenvora/shared';
import { audioHaptics } from './audio-haptics';
import { requestOtpAction, verifyOtpAction, setupMpinAction, loginWithMpinAction, logoutAction } from '../app/actions/auth';
import { addMoneyAction, claimWelcomeBonusAction, requestWithdrawalAction, getWalletAction, getTransactionHistoryAction } from '../app/actions/wallet';
import { placeBetAction, publishResultAction } from '../app/actions/betting';
import { getMarketsAction, seedMarketsAction } from '../app/actions/markets';

export const BET_RULES: Record<BetTypeCode, BetTypeRule> = {
  [BetTypeCode.SINGLE_ANK]: {
    code: BetTypeCode.SINGLE_ANK,
    name: 'Single Ank',
    multiplier: 9.5,
    minAmount: 10,
    maxAmount: 10000,
    description: 'Pick single digit from 0 to 9 for Open or Close',
  },
  [BetTypeCode.JODI]: {
    code: BetTypeCode.JODI,
    name: 'Jodi',
    multiplier: 95,
    minAmount: 10,
    maxAmount: 5000,
    description: 'Pick two digit pair from 00 to 99',
  },
  [BetTypeCode.SINGLE_PATTI]: {
    code: BetTypeCode.SINGLE_PATTI,
    name: 'Single Patti',
    multiplier: 150,
    minAmount: 10,
    maxAmount: 2500,
    description: 'Pick 3 distinct ascending digits (e.g. 128, 345)',
  },
  [BetTypeCode.DOUBLE_PATTI]: {
    code: BetTypeCode.DOUBLE_PATTI,
    name: 'Double Patti',
    multiplier: 300,
    minAmount: 10,
    maxAmount: 1500,
    description: 'Pick 3 digits with one pair (e.g. 118, 226)',
  },
  [BetTypeCode.TRIPLE_PATTI]: {
    code: BetTypeCode.TRIPLE_PATTI,
    name: 'Triple Patti',
    multiplier: 700,
    minAmount: 10,
    maxAmount: 1000,
    description: 'Pick 3 identical digits (e.g. 000, 111, 777)',
  },
  [BetTypeCode.HALF_SANGAM]: {
    code: BetTypeCode.HALF_SANGAM,
    name: 'Half Sangam',
    multiplier: 1000,
    minAmount: 10,
    maxAmount: 500,
    description: 'Open Patti with Close Ank or Open Ank with Close Patti',
  },
  [BetTypeCode.FULL_SANGAM]: {
    code: BetTypeCode.FULL_SANGAM,
    name: 'Full Sangam',
    multiplier: 10000,
    minAmount: 10,
    maxAmount: 200,
    description: 'Exact Open Patti and Close Patti combination',
  },
};



interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // User & Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeOtpCode: string | null;
  lastPhoneAttempted: string | null;
  requestOtp: (phone: string) => Promise<{ success: boolean; otp?: string; message?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean; requiresMpin: boolean }>;
  setupMpin: (mpin: string) => Promise<{ success: boolean }>;
  loginWithMpin: (phone: string, mpin: string) => Promise<{ success: boolean }>;
  logout: () => void;
  claimWelcomeBonus: () => Promise<{ success: boolean; amount: number }>;
  isBonusClaimed: boolean;

  // Wallet
  wallet: WalletBalance;
  transactions: TransactionRecord[];
  addMoney: (amount: number, utr: string) => Promise<{ success: boolean; txnId: string }>;
  requestWithdrawal: (amount: number, upiOrBank: string) => Promise<{ success: boolean; txnId: string; message: string }>;

  // Markets
  markets: Market[];
  getMarketBySlug: (slug: string) => Market | undefined;

  // Betting
  bets: BetItem[];
  placeBet: (request: PlaceBetRequest) => Promise<{ success: boolean; bet?: BetItem; message?: string }>;

  // Results & Settlement
  results: ResultEntry[];
  adminPublishResult: (
    marketId: string,
    openPatti: string,
    openAnk: string,
    closeAnk: string,
    closePatti: string
  ) => Promise<{ success: boolean; settledBetsCount: number; totalPayout: number }>;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Support
  supportTickets: SupportTicket[];
  createSupportTicket: (subject: string, message: string) => Promise<{ success: boolean; ticketId: string }>;
  addTicketMessage: (ticketId: string, message: string) => Promise<{ success: boolean }>;

  // UI / Toast
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Admin Role (from actual user object)
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // State Initialization
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [lastPhoneAttempted, setLastPhoneAttempted] = useState<string | null>(null);
  const [isBonusClaimed, setIsBonusClaimed] = useState<boolean>(false);
  
  const isAdmin = user?.role === UserRole.ADMIN;

  const [wallet, setWallet] = useState<WalletBalance>({
    cashBalance: 0,
    bonusBalance: 0,
    lockedBalance: 0,
    totalBalance: 0,
    currency: 'INR',
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const [markets, setMarkets] = useState<Market[]>([]);
  const [bets, setBets] = useState<BetItem[]>([]);
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load persisted session on client
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('lucky777_user');
      const savedBonus = localStorage.getItem('lucky777_bonus_claimed');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      }
      if (savedBonus === 'true') {
        setIsBonusClaimed(true);
      }
    } catch {}

    // Seed and load markets globally once
    seedMarketsAction().then(() => {
      getMarketsAction().then(res => {
        if (res.success && res.markets) {
          setMarkets(res.markets);
        }
      });
    });
  }, []);

  // Fetch Authoritative Wallet and Transactions from server
  useEffect(() => {
    if (user) {
      getWalletAction().then(res => {
        if (res.success && res.balances) {
          setWallet({
            ...res.balances,
            currency: 'INR'
          } as WalletBalance);
        }
      });
      getTransactionHistoryAction().then(res => {
        if (res.success && res.transactions) {
          // Map DB transactions to frontend format
          const mapped = res.transactions.map((t: any) => ({
            id: t.id,
            userId: t.userId,
            type: t.type,
            status: t.status,
            amount: t.amountMinor,
            currency: t.currency,
            balanceType: BalanceType.CASH, // simplified
            reference: t.externalReference || t.idempotencyKey || '',
            description: t.type,
            createdAt: new Date(t.createdAt).toISOString(),
            completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
          }));
          setTransactions(mapped);
        }
      });
    }
  }, [user]);

  // Update total balance helper
  const updateBalance = useCallback((cash: number, bonus: number, locked: number) => {
    setWallet({
      cashBalance: cash,
      bonusBalance: bonus,
      lockedBalance: locked,
      totalBalance: cash + bonus + locked,
      currency: 'INR',
    });
  }, []);

  // Toast Trigger
  const showToast = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auth: Request OTP
  const requestOtp = async (phone: string) => {
    const result = await requestOtpAction(phone);
    if (!result.success) {
      showToast('error', 'Error', result.message || 'Failed to request OTP');
      return { success: false, message: result.message };
    }

    setActiveOtpCode(null);
    setLastPhoneAttempted(phone);
    audioHaptics.playTap();

    showToast(
      'info',
      'OTP Sent via SMS',
      `Please check your mobile number (+91 ${phone}) for the OTP.`
    );

    return { success: true };
  };

  // Auth: Verify OTP
  const verifyOtp = async (phone: string, otp: string) => {
    audioHaptics.playTap();
    
    const result = await verifyOtpAction(phone, otp);
    
    if (!result.success || !result.user) {
      showToast('error', 'Error', result.message || 'Invalid OTP');
      return { success: false, isNewUser: false, requiresMpin: false };
    }

    // Since our backend logic doesn't know about Admin status on login right now, we keep the role as returned
    const finalUser = {
      ...result.user,
      role: isAdmin ? UserRole.ADMIN : result.user.role,
    };

    setUser(finalUser as UserProfile);
    localStorage.setItem('lucky777_user', JSON.stringify(finalUser));
    showToast('success', 'Mobile Verified', 'Phone number authenticated successfully.');

    return {
      success: true,
      isNewUser: result.isNewUser || false,
      requiresMpin: result.requiresMpin || false,
    };
  };

  // Auth: Setup MPIN
  const setupMpin = async (_mpin: string) => {
    audioHaptics.playTap();
    if (!user) return { success: false };

    const result = await setupMpinAction(_mpin);
    
    if (!result.success) {
      showToast('error', 'Error', result.message || 'Failed to setup MPIN');
      return { success: false };
    }

    const updated: UserProfile = {
      ...user,
      hasMpin: true,
      updatedAt: new Date().toISOString(),
    };

    setUser(updated);
    localStorage.setItem('lucky777_user', JSON.stringify(updated));
    showToast('success', 'MPIN Created', 'Your 6-digit MPIN is secured.');
    return { success: true };
  };

  // Auth: Login with MPIN
  const loginWithMpin = async (phone: string, mpin: string) => {
    audioHaptics.playTap();
    
    const result = await loginWithMpinAction(phone, mpin);
    
    if (!result.success || !result.user) {
      showToast('error', 'Error', result.message || 'Invalid MPIN');
      return { success: false };
    }

    const finalUser = {
      ...result.user,
      role: isAdmin ? UserRole.ADMIN : result.user.role,
    };

    setUser(finalUser as UserProfile);
    localStorage.setItem('lucky777_user', JSON.stringify(finalUser));
    showToast('success', 'Welcome Back', `Logged in as +91 ${phone}`);
    return { success: true };
  };

  // Auth: Logout
  const logout = async () => {
    audioHaptics.playTap();
    await logoutAction();
    setUser(null);
    localStorage.removeItem('lucky777_user');
    showToast('info', 'Logged Out', 'Your session has ended securely.');
  };

  // Promotions: Claim ₹100 Welcome Bonus
  const claimWelcomeBonus = async () => {
    audioHaptics.playWin();
    if (!user) return { success: false, amount: 0 };
    if (isBonusClaimed) {
      showToast('warning', 'Already Claimed', 'Welcome bonus has already been claimed on this account.');
      return { success: false, amount: 0 };
    }

    const result = await claimWelcomeBonusAction();
    if (!result.success) {
      showToast('error', 'Error', result.message || 'Failed to claim bonus');
      return { success: false, amount: 0 };
    }

    const bonusAmount = result.amount || 100;
    const newBonusBal = wallet.bonusBalance + bonusAmount;
    updateBalance(wallet.cashBalance, newBonusBal, wallet.lockedBalance);

    setIsBonusClaimed(true);
    localStorage.setItem('lucky777_bonus_claimed', 'true');

    // Send in-app notification
    const bonusNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: user.id,
      title: '🎉 ₹100 Welcome Bonus Credited!',
      body: 'Your ₹100 promotional bonus is active. Use it on any live market today!',
      type: 'BONUS_CLAIMED',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [bonusNotif, ...prev]);

    showToast('success', 'Bonus Credited', '₹100 Welcome Bonus added to your wallet!');
    return { success: true, amount: bonusAmount };
  };

  // Wallet: Add Money
  const addMoney = async (amount: number, utr: string) => {
    audioHaptics.playTap();
    if (!user) return { success: false, txnId: '' };

    const result = await addMoneyAction(amount, utr);
    if (!result.success) {
      showToast('error', 'Error', result.message || 'Failed to submit deposit');
      return { success: false, txnId: '' };
    }

    // Do NOT increment cashBalance here! It is pending owner verification.
    
    showToast('info', 'Deposit Pending', `₹${amount.toLocaleString()} deposit request submitted and is under review.`);
    return { success: true, txnId: result.txnId || '' };
  };

  // Wallet: Request Withdrawal
  const requestWithdrawal = async (amount: number, upiOrBank: string) => {
    audioHaptics.playTap();
    if (!user) return { success: false, txnId: '', message: 'User not found' };
    
    if (amount > wallet.cashBalance) {
      showToast('error', 'Insufficient Funds', 'Insufficient cash balance for this withdrawal');
      return { success: false, txnId: '', message: 'Insufficient cash balance' };
    }

    const idempotencyKey = 'WTH-KEY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const result = await requestWithdrawalAction(amount, upiOrBank, idempotencyKey);
    if (!result.success) {
      showToast('error', 'Error', result.message || 'Failed to request withdrawal');
      return { success: false, txnId: '', message: result.message || 'Error' };
    }

    const newCash = wallet.cashBalance - amount;
    const newLocked = wallet.lockedBalance + amount;
    updateBalance(newCash, wallet.bonusBalance, newLocked);

    showToast('info', 'Withdrawal Pending', `Automated payouts are currently unavailable. Withdrawal will remain PENDING.`);
    return { success: true, txnId: result.txnId || '', message: 'Withdrawal requested successfully' };
  };

  // Betting Engine: Place Bet (Atomic balance debit + ledger creation)
  const placeBet = async (req: PlaceBetRequest) => {
    if (!user) return { success: false, message: 'Please login to place bets' };
    
    const market = markets.find((m) => m.id === req.marketId);
    if (!market) {
      showToast('error', 'Market Error', 'Selected market does not exist');
      return { success: false, message: 'Invalid market' };
    }

    if (market.status !== MarketStatus.OPEN) {
      showToast('error', 'Market Closed', 'Betting is closed for this market');
      return { success: false, message: 'Market is closed' };
    }

    const rule = BET_RULES[req.betType];
    if (req.amount < rule.minAmount || req.amount > rule.maxAmount) {
      showToast('error', 'Limit Exceeded', `Amount must be between ₹${rule.minAmount} and ₹${rule.maxAmount}`);
      return { success: false, message: 'Invalid bet amount' };
    }

    if (wallet.totalBalance < req.amount) {
      showToast('error', 'Insufficient Balance', 'Please recharge your wallet or reduce your bet amount');
      return { success: false, message: 'Insufficient balance' };
    }

    // Call server action to securely deduct balance and place bet
    const result = await placeBetAction(req);
    if (!result.success) {
      showToast('error', 'Error', result.message || 'Failed to place bet');
      return { success: false, message: result.message };
    }

    const potentialWin = result.potentialWin || Math.round(req.amount * rule.multiplier);
    const refNo = result.refNo || 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Optimistically update local balance
    let debitFromBonus = 0;
    let debitFromCash = 0;

    if (wallet.bonusBalance >= req.amount) {
      debitFromBonus = req.amount;
    } else if (wallet.bonusBalance > 0) {
      debitFromBonus = wallet.bonusBalance;
      debitFromCash = req.amount - debitFromBonus;
    } else {
      debitFromCash = req.amount;
    }

    const newBonus = wallet.bonusBalance - debitFromBonus;
    const newCash = wallet.cashBalance - debitFromCash;
    updateBalance(newCash, newBonus, wallet.lockedBalance);

    const newBet: BetItem = {
      id: result.betId || 'bet-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      marketId: market.id,
      marketName: market.name,
      betTypeCode: req.betType,
      betTypeName: `${rule.name} ${req.session ? `(${req.session})` : ''}`,
      selection: req.selection,
      session: req.session,
      amount: req.amount,
      potentialWin,
      status: BetStatus.ACTIVE,
      referenceNumber: refNo,
      placedAt: new Date().toISOString(),
    };

    setBets((prev) => [newBet, ...prev]);

    audioHaptics.playBetSuccess();
    showToast('success', 'Bet Placed! 🎉', `Ref: ${refNo} | Win Potential: ₹${potentialWin.toLocaleString()}`);

    return { success: true, bet: newBet };
  };

  // Results & Settlement Engine: Admin Publish & Settle
  const adminPublishResult = async (
    marketId: string,
    openPatti: string,
    openAnk: string,
    closeAnk: string,
    closePatti: string
  ) => {
    const market = markets.find((m) => m.id === marketId);
    if (!market) return { success: false, settledBetsCount: 0, totalPayout: 0 };

    // Call server action
    const actionRes = await publishResultAction(marketId, openPatti, openAnk, closeAnk, closePatti);
    if (!actionRes.success) {
      showToast('error', 'Error', actionRes.message || 'Failed to publish result');
      return { success: false, settledBetsCount: 0, totalPayout: 0 };
    }

    const displayVal = `${openPatti || '***'}-${openAnk || '*'}${closeAnk || '*'}-${closePatti || '***'}`;
    const resultDate = new Date().toISOString().split('T')[0];

    // Create Result Record
    const resultId = actionRes.resultId || 'res-' + Math.random().toString(36).substring(2, 7);
    const newResultEntry: ResultEntry = {
      id: resultId,
      marketId: market.id,
      marketName: market.name,
      resultDate,
      openPatti,
      openAnk,
      closeAnk,
      closePatti,
      displayValue: displayVal,
      status: ResultWorkflowStatus.PUBLISHED,
      publishedAt: new Date().toISOString(),
    };

    setResults((prev) => [newResultEntry, ...prev.filter((r) => r.marketId !== marketId)]);

    // Update Market Card
    setMarkets((prev) =>
      prev.map((m) =>
        m.id === marketId
          ? {
              ...m,
              latestResult: {
                id: resultId,
                marketId,
                resultDate,
                openPatti,
                openAnk,
                closeAnk,
                closePatti,
                displayValue: displayVal,
                publishedAt: new Date().toISOString(),
              },
            }
          : m
      )
    );

    // Settlement calculation: match active bets
    let settledCount = 0;
    let totalPayout = 0;
    let additionalCash = 0;

    const updatedBets = bets.map((bet) => {
      if (bet.marketId !== marketId || bet.status !== BetStatus.ACTIVE) {
        return bet;
      }

      settledCount++;
      let isWin = false;

      // Evaluation rules
      if (bet.betTypeCode === BetTypeCode.SINGLE_ANK) {
        if (bet.session === 'OPEN' && bet.selection === openAnk) isWin = true;
        if (bet.session === 'CLOSE' && bet.selection === closeAnk) isWin = true;
      } else if (bet.betTypeCode === BetTypeCode.JODI) {
        const jodiResult = `${openAnk}${closeAnk}`;
        if (bet.selection === jodiResult) isWin = true;
      } else if (bet.betTypeCode === BetTypeCode.SINGLE_PATTI || bet.betTypeCode === BetTypeCode.DOUBLE_PATTI || bet.betTypeCode === BetTypeCode.TRIPLE_PATTI) {
        if (bet.session === 'OPEN' && bet.selection === openPatti) isWin = true;
        if (bet.session === 'CLOSE' && bet.selection === closePatti) isWin = true;
      }

      if (isWin) {
        const winAmount = bet.potentialWin;
        totalPayout += winAmount;
        additionalCash += winAmount;

        // Create settlement ledger entry
        const winTxn: TransactionRecord = {
          id: 'TXN-WIN-' + bet.referenceNumber,
          userId: bet.userId,
          type: TransactionType.BET_WON,
          status: TransactionStatus.COMPLETED,
          amount: winAmount,
          currency: 'INR',
          balanceType: BalanceType.CASH,
          reference: bet.referenceNumber,
          description: `Winning payout for Bet #${bet.referenceNumber} on ${market.name}`,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        setTransactions((prev) => [winTxn, ...prev]);

        return {
          ...bet,
          status: BetStatus.WON,
          payoutAmount: winAmount,
          settledAt: new Date().toISOString(),
        };
      } else {
        return {
          ...bet,
          status: BetStatus.LOST,
          payoutAmount: 0,
          settledAt: new Date().toISOString(),
        };
      }
    });

    setBets(updatedBets);

    if (additionalCash > 0) {
      updateBalance(wallet.cashBalance + additionalCash, wallet.bonusBalance, wallet.lockedBalance);
      audioHaptics.playWin();
      showToast('success', 'Big Win Settled! 🏆', `₹${additionalCash.toLocaleString()} credited from winning bets.`);
    } else {
      showToast('info', 'Market Settled', `${market.name} results published (${displayVal}).`);
    }

    return { success: true, settledBetsCount: settledCount, totalPayout };
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  // Support
  const createSupportTicket = async (subject: string, message: string) => {
    const ticketId = 'TCK-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: ticketId,
      userId: user?.id || 'usr-1',
      subject,
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderId: user?.id || 'usr-1',
          senderRole: UserRole.USER,
          message,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    showToast('success', 'Ticket Created', `Support ticket #${ticketId} created. We will reply shortly.`);
    return { success: true, ticketId };
  };

  const addTicketMessage = async (ticketId: string, message: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            updatedAt: new Date().toISOString(),
            messages: [
              ...t.messages,
              {
                id: 'msg-' + Date.now(),
                senderId: user?.id || 'usr-1',
                senderRole: isAdmin ? UserRole.ADMIN : UserRole.USER,
                message,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return t;
      })
    );
    return { success: true };
  };


  const getMarketBySlug = (slug: string) => {
    return markets.find((m) => m.slug === slug);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeOtpCode,
        lastPhoneAttempted,
        requestOtp,
        verifyOtp,
        setupMpin,
        loginWithMpin,
        logout,
        claimWelcomeBonus,
        isBonusClaimed,
        wallet,
        transactions,
        addMoney,
        requestWithdrawal,
        markets,
        getMarketBySlug,
        bets,
        placeBet,
        results,
        adminPublishResult,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        supportTickets,
        createSupportTicket,
        addTicketMessage,
        toasts,
        showToast,
        removeToast,
        isAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
