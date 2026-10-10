# Lucky 777 — Complete Full-Stack MVP

**File:** `mvp.md`  
**Product:** Lucky 777  
**Version:** 1.1  
**Type:** Satta Matka / Market Gaming Platform  
**Architecture:** Full-stack web application  
**Frontend:** Next.js + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Cache / Jobs:** Redis + BullMQ  
**Deployment:** Docker

---

# 1. Product Overview

Lucky 777 is a mobile-first Satta Matka platform consisting of:

1. Public results and market information.
2. User registration/login through mobile OTP.
3. MPIN-based account access.
4. Promotional welcome bonus.
5. User wallet.
6. Add-money flow.
7. Market browsing.
8. Betting interface.
9. User bet history.
10. Results and settlement.
11. Notifications.
12. User support.
13. Complete admin dashboard.
14. Market, result, user, wallet, promotion and reporting management.

The implementation should use original branding, original UI assets and independently written code.

Any monetary functionality must operate only according to the approved licensed product scope and supported payment/gaming integrations.

---

# 2. Core User Journey

The primary mobile user journey is:

```text
                    OPEN APP
                       |
                       v
                 LOGIN / SIGN UP
                       |
                       v
                  MOBILE OTP
                       |
                       v
                VERIFY OTP
                       |
              +--------+--------+
              |                 |
          NEW USER          EXISTING USER
              |                 |
              v                 |
          SET MPIN              |
              |                 |
              +--------+--------+
                       |
                       v
                 HOME / WELCOME
                       |
                       v
               CLAIM ₹100 BONUS
                       |
                       v
              +--------+---------+
              |                  |
              v                  v
         ADD MONEY       CONTINUE BETTING
              |                  |
              v                  |
        PAYMENT FLOW             |
              |                  |
              +--------+---------+
                       |
                       v
                    MARKETS
                       |
                       v
                  SELECT MARKET
                       |
                       v
                  BETTING UI
                       |
                       v
                  PLACE BET
                       |
                       v
                 MY BETS
                       |
                       v
                    RESULT
                       |
                       v
                  SETTLEMENT
                       |
                       v
                    WALLET
```

---

# 3. Authentication Flow

## 3.1 Login Screen

Route:
`/login`

## 3.2 OTP Verification
Route: `/login/otp`

## 3.3 MPIN Setup
Route: `/setup-mpin`

## 3.4 Welcome Bonus
Route: `/welcome` -> `/after-bonus`

---

# 4. Project Structure

```text
lucky777/
│
├── apps/
│   ├── web/        # Next.js 14+ App Router Frontend (Mobile-First Premium UI)
│   └── api/        # NestJS Backend (Prisma, BullMQ, Auth, Settlement, Wallet Engine)
├── packages/
│   └── shared/     # Shared DTOs, Enums, Types
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
└── mvp.md
```
