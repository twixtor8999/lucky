# Lucky777 Admin Workflow & Manual Operations Plan

This document outlines the day-to-day operations of the Lucky777 platform. The entire architecture is built around **100% manual control** for the administrator, ensuring absolute authority over all financial and game-related transactions without relying on automated payment gateways.

### 1. User Onboarding & The Welcome Bonus
* **User Action:** A new player downloads the app and logs in securely using OTP, then sets up a 6-digit MPIN. Their wallet balance is initially ₹0.
* **Admin Action:** The admin logs into the Admin Dashboard and navigates to the **Users & Bonuses** tab to see new registrations. The admin manually clicks *“Credit Bonus”*, enters an amount (e.g., ₹100), and it instantly appears in the player's app wallet.

### 2. Manual Deposits (Adding Money)
* **User Action:** The player goes to "Add Money". They are presented with a dynamic UPI QR code/UPI ID (which can be changed anytime in Admin Settings). They send money (e.g., ₹500) via their preferred UPI app (PhonePe/GPay) and submit the 12-digit UTR reference number in the Lucky777 app.
* **Admin Action:** The admin receives a notification. They check their actual banking/UPI app to confirm the ₹500 has arrived. Then, they go to the **Deposit Requests** tab in the Admin Dashboard, locate the corresponding UTR, and click *“Approve”*. The system then adds ₹500 to the player's app wallet.

### 3. Playing the Markets
* **User Action:** The player uses their wallet balance to place bets on live markets (e.g., Kalyan, Single Ank, Jodi, etc.).
* **System Action:** The bet amount is instantly deducted from the player's wallet. The bet ticket is saved in the database with a status of `PENDING`.

### 4. Declaring Results
* **Admin Action:** When a real-world market closes, the admin goes to the **Market Management** tab in the Admin Dashboard and manually types in the exact Open/Close results.
* **System Action:** As soon as the admin clicks publish, the live results update instantly on the PWA for all players to see.

### 5. Manual Winning Payouts (Complete Admin Grip)
* **Admin Action:** Once results are declared, the admin goes to the **Pending Payouts** tab. The system displays exactly who won and who lost. Instead of the system automatically transferring money into wallets, **the admin reviews the winners**. The admin clicks *“Pay Winners”*, and *only then* does the system credit the winning amounts into the respective in-app wallets.

### 6. Manual Withdrawals
* **User Action:** A player wins and requests to cash out (e.g., ₹2000). They go to the "Withdraw" page, enter their Bank/UPI details, and submit a request. The ₹2000 is temporarily locked and deducted from their playable balance.
* **Admin Action:** The admin goes to the **Withdrawal Requests** tab and views the player's bank details. The admin opens their PhonePe/Bank app and manually transfers the real ₹2000. Once the transfer is complete, the admin clicks *“Mark as Paid”* in the dashboard, finalizing the withdrawal in the system.

### 7. Support & Settings
* **Admin Action:** Whenever the admin wants to update the support contact number or the receiving payment UPI ID, they navigate to **System Settings** in the dashboard, input the new details, and save. The entire app instantly updates for all players.
