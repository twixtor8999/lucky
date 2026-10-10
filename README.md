# 🎰 ZENVORA — Mobile-First Progressive Web App (PWA)

Lucky 777 is a state-of-the-art, mobile-first Satta Matka and live market gaming platform built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL**, and **Redis**.

---

## 📱 First-Class PWA Capabilities

- **Installable Native App Shell**: Full `manifest.webmanifest` configuration for Android/iOS standalone home-screen launch with custom gold luxury icons.
- **Service Worker (`sw.js`)**: Offline fallback page, precaching of shell assets, and zero-caching security policy for financial API/wallet requests.
- **Mobile-First Touch Architecture**:
  - Touch-optimized Bottom Navigation (Home, Markets, My Bets, Wallet, Account)
  - Sticky wallet chip with live balance updates
  - Safe-area inset support (`env(safe-area-inset-bottom)`)
  - Web Audio API synthesizer for native haptics, chips, bet placement, and win celebrations
  - Bottom-sheet confirmation dialogs and custom numeric keypads

---

## ⚡ Core User Journey

1. **Splash & Login (`/login`)**: Enter 10-digit mobile number (+91).
2. **OTP Verification (`/login/otp`)**: Auto-advancing 6-digit OTP verification with countdown timer (Demo code: `774422`).
3. **MPIN Setup (`/setup-mpin`)**: Create and confirm secure 6-digit MPIN with interactive on-screen numeric keypad.
4. **Welcome Reward (`/welcome`)**: First-time onboarding celebration with confetti and **Claim ₹100 Welcome Bonus**.
5. **Post-Bonus Decision (`/after-bonus`)**: Instant decision matrix: "Continue Betting" or "Add Money".
6. **Live Markets (`/home`, `/markets`)**: Browse real-time opening/closing markets (Kalyan, Milan, Time Bazar) with live closing countdown clocks.
7. **Betting Room (`/markets/[slug]/play`)**:
   - Single Ank (0-9, Open/Close Session)
   - Jodi (00-99)
   - Single Patti, Double Patti, Triple Patti, Sangam
   - Quick chips (₹10, ₹20, ₹50, ₹100, ₹500), live total stake and maximum potential win calculation
8. **My Bets (`/bets`)**: Real-time tickets with `[ ACTIVE ]`, `[ COMPLETED ]`, and win/loss badges.
9. **Live Results (`/results`)**: Declared Matka panel charts and search.
10. **Wallet & Ledger (`/wallet`)**:
    - Multi-balance separation: **Cash Balance**, **Bonus Balance (₹100)**, **Locked Balance**
    - Deposit via UPI/QR (`/wallet/add-money`)
    - Withdrawal to UPI/Bank (`/wallet/withdraw`)
11. **Admin Control Portal (`/admin`)**:
    - Real-time KPIs (Active Markets, Pending Bets, Today's Volume)
    - **Result Declaration & 1-Click Settlement Engine**: Declare Open/Close Patti & Ank -> Automatically settle all winning bets and credit user wallets with winning multipliers.

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run the PWA in development mode
npm run dev:web
# Open http://localhost:3000 on your mobile browser / DevTools mobile view
```
