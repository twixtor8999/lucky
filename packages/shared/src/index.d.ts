export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    SUPPORT = "SUPPORT"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    BLOCKED = "BLOCKED"
}
export interface UserProfile {
    id: string;
    phone: string;
    displayName: string | null;
    status: UserStatus;
    role: UserRole;
    phoneVerifiedAt: string | null;
    hasMpin: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface AuthSession {
    token: string;
    user: UserProfile;
    requiresMpinSetup: boolean;
    isNewUser: boolean;
}
export declare enum MarketStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    SUSPENDED = "SUSPENDED",
    ARCHIVED = "ARCHIVED"
}
export declare enum BetTypeCode {
    SINGLE_ANK = "SINGLE_ANK",// 0-9 (Open or Close)
    JODI = "JODI",// 00-99
    SINGLE_PATTI = "SINGLE_PATTI",// e.g. 128, 137
    DOUBLE_PATTI = "DOUBLE_PATTI",// e.g. 118, 227
    TRIPLE_PATTI = "TRIPLE_PATTI",// e.g. 000, 111, 777
    HALF_SANGAM = "HALF_SANGAM",
    FULL_SANGAM = "FULL_SANGAM"
}
export interface BetTypeRule {
    code: BetTypeCode;
    name: string;
    multiplier: number;
    minAmount: number;
    maxAmount: number;
    description: string;
}
export interface Market {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    status: MarketStatus;
    openTime: string;
    closeTime: string;
    resultTime: string;
    isOpenToday: boolean;
    currentOpenTime: string;
    currentCloseTime: string;
    latestResult?: MarketResultSummary | null;
    favourite?: boolean;
}
export interface MarketResultSummary {
    id: string;
    marketId: string;
    resultDate: string;
    openPatti?: string | null;
    openAnk?: string | null;
    closeAnk?: string | null;
    closePatti?: string | null;
    displayValue: string;
    publishedAt: string;
}
export declare enum BetStatus {
    ACTIVE = "ACTIVE",
    WON = "WON",
    LOST = "LOST",
    CANCELLED = "CANCELLED",
    SETTLED = "SETTLED"
}
export interface BetItem {
    id: string;
    userId: string;
    marketId: string;
    marketName?: string;
    betTypeCode: BetTypeCode;
    betTypeName?: string;
    selection: string;
    session?: 'OPEN' | 'CLOSE';
    amount: number;
    potentialWin: number;
    status: BetStatus;
    payoutAmount?: number | null;
    referenceNumber: string;
    placedAt: string;
    settledAt?: string | null;
}
export interface PlaceBetRequest {
    marketId: string;
    betType: BetTypeCode;
    selection: string;
    session?: 'OPEN' | 'CLOSE';
    amount: number;
    idempotencyKey: string;
}
export declare enum BalanceType {
    CASH = "CASH",
    BONUS = "BONUS",
    LOCKED = "LOCKED"
}
export declare enum LedgerEntryType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    BET_PLACED = "BET_PLACED",
    BET_WON = "BET_WON",
    BET_REFUND = "BET_REFUND",
    WELCOME_BONUS = "WELCOME_BONUS",
    PROMOTIONAL_BONUS = "PROMOTIONAL_BONUS",
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REJECTED = "REJECTED"
}
export interface WalletBalance {
    cashBalance: number;
    bonusBalance: number;
    lockedBalance: number;
    totalBalance: number;
    currency: string;
}
export interface TransactionRecord {
    id: string;
    userId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    balanceType: BalanceType;
    reference?: string | null;
    description: string;
    createdAt: string;
    completedAt?: string | null;
}
export declare enum ResultWorkflowStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    PUBLISHED = "PUBLISHED",
    REJECTED = "REJECTED"
}
export interface ResultEntry {
    id: string;
    marketId: string;
    marketName?: string;
    resultDate: string;
    openPatti: string;
    openAnk: string;
    closeAnk: string;
    closePatti: string;
    displayValue: string;
    status: ResultWorkflowStatus;
    submittedBy?: string | null;
    approvedBy?: string | null;
    publishedAt?: string | null;
}
export interface WelcomeBonusCampaign {
    id: string;
    name: string;
    amount: number;
    currency: string;
    active: boolean;
    expiryDays: number;
    description: string;
    claimed?: boolean;
}
export interface NotificationItem {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    readAt?: string | null;
    createdAt: string;
}
export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    updatedAt: string;
    messages: Array<{
        id: string;
        senderId: string;
        senderRole: UserRole;
        message: string;
        createdAt: string;
    }>;
}
