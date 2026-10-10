"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appSettings = exports.marketsRelations = exports.walletsRelations = exports.usersRelations = exports.deposits = exports.systemSettings = exports.auditLogs = exports.supportMessages = exports.supportTickets = exports.notifications = exports.withdrawals = exports.bonusClaims = exports.bonusCampaigns = exports.transactions = exports.ledgerEntries = exports.wallets = exports.results = exports.bets = exports.marketSchedules = exports.markets = exports.sessions = exports.otpVerifications = exports.mpins = exports.users = exports.ticketPriorityEnum = exports.ticketStatusEnum = exports.transactionStatusEnum = exports.transactionTypeEnum = exports.ledgerEntryTypeEnum = exports.balanceTypeEnum = exports.betStatusEnum = exports.marketStatusEnum = exports.userStatusEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Enums
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['USER', 'ADMIN', 'SUPPORT']);
exports.userStatusEnum = (0, pg_core_1.pgEnum)('user_status', ['ACTIVE', 'SUSPENDED', 'BLOCKED']);
exports.marketStatusEnum = (0, pg_core_1.pgEnum)('market_status', ['OPEN', 'CLOSED', 'SUSPENDED', 'ARCHIVED']);
exports.betStatusEnum = (0, pg_core_1.pgEnum)('bet_status', ['ACTIVE', 'WON', 'LOST', 'CANCELLED', 'SETTLED']);
exports.balanceTypeEnum = (0, pg_core_1.pgEnum)('balance_type', ['CASH', 'BONUS', 'LOCKED']);
exports.ledgerEntryTypeEnum = (0, pg_core_1.pgEnum)('ledger_entry_type', ['CREDIT', 'DEBIT']);
exports.transactionTypeEnum = (0, pg_core_1.pgEnum)('transaction_type', [
    'DEPOSIT',
    'WITHDRAWAL',
    'BET_PLACED',
    'BET_WON',
    'BET_REFUND',
    'WELCOME_BONUS',
    'PROMOTIONAL_BONUS',
    'ADMIN_ADJUSTMENT',
]);
exports.transactionStatusEnum = (0, pg_core_1.pgEnum)('transaction_status', ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED']);
exports.ticketStatusEnum = (0, pg_core_1.pgEnum)('ticket_status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
exports.ticketPriorityEnum = (0, pg_core_1.pgEnum)('ticket_priority', ['LOW', 'MEDIUM', 'HIGH']);
// 1. Users Table
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).notNull().unique(),
    displayName: (0, pg_core_1.varchar)('display_name', { length: 100 }),
    status: (0, exports.userStatusEnum)('status').default('ACTIVE').notNull(),
    role: (0, exports.roleEnum)('role').default('USER').notNull(),
    phoneVerifiedAt: (0, pg_core_1.timestamp)('phone_verified_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// 2. MPINs Table
exports.mpins = (0, pg_core_1.pgTable)('mpins', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' })
        .unique(),
    mpinHash: (0, pg_core_1.text)('mpin_hash').notNull(),
    failedAttempts: (0, pg_core_1.integer)('failed_attempts').default(0).notNull(),
    lockedUntil: (0, pg_core_1.timestamp)('locked_until', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// 3. OTP Verifications Table
exports.otpVerifications = (0, pg_core_1.pgTable)('otp_verifications', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).notNull(),
    otpHash: (0, pg_core_1.text)('otp_hash').notNull(),
    purpose: (0, pg_core_1.varchar)('purpose', { length: 50 }).default('LOGIN').notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }).notNull(),
    attemptCount: (0, pg_core_1.integer)('attempt_count').default(0).notNull(),
    verifiedAt: (0, pg_core_1.timestamp)('verified_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    phoneIdx: (0, pg_core_1.index)('otp_phone_idx').on(table.phone),
}));
// 4. Sessions Table
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    tokenHash: (0, pg_core_1.text)('token_hash').notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }).notNull(),
    revokedAt: (0, pg_core_1.timestamp)('revoked_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
});
// 5. Markets Table
exports.markets = (0, pg_core_1.pgTable)('markets', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 150 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 150 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    status: (0, exports.marketStatusEnum)('status').default('OPEN').notNull(),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }).default('Asia/Kolkata').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    archivedAt: (0, pg_core_1.timestamp)('archived_at', { withTimezone: true }),
});
// 6. Market Schedules Table
exports.marketSchedules = (0, pg_core_1.pgTable)('market_schedules', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    marketId: (0, pg_core_1.uuid)('market_id')
        .notNull()
        .references(() => exports.markets.id, { onDelete: 'cascade' }),
    dayOfWeek: (0, pg_core_1.integer)('day_of_week').notNull(), // 0 = Sun, 6 = Sat
    opensAt: (0, pg_core_1.varchar)('opens_at', { length: 20 }).notNull(), // e.g. "11:00 AM"
    closesAt: (0, pg_core_1.varchar)('closes_at', { length: 20 }).notNull(), // e.g. "12:00 PM"
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }).default('Asia/Kolkata').notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    effectiveFrom: (0, pg_core_1.timestamp)('effective_from', { withTimezone: true }).defaultNow().notNull(),
    effectiveUntil: (0, pg_core_1.timestamp)('effective_until', { withTimezone: true }),
});
// 7. Bets Table
exports.bets = (0, pg_core_1.pgTable)('bets', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    marketId: (0, pg_core_1.uuid)('market_id')
        .notNull()
        .references(() => exports.markets.id, { onDelete: 'cascade' }),
    betTypeCode: (0, pg_core_1.varchar)('bet_type_code', { length: 50 }).notNull(),
    selection: (0, pg_core_1.varchar)('selection', { length: 50 }).notNull(),
    session: (0, pg_core_1.varchar)('session', { length: 20 }), // "OPEN" | "CLOSE"
    amountMinor: (0, pg_core_1.bigint)('amount_minor', { mode: 'number' }).notNull(), // in paise or Rupees
    status: (0, exports.betStatusEnum)('status').default('ACTIVE').notNull(),
    idempotencyKey: (0, pg_core_1.varchar)('idempotency_key', { length: 100 }).notNull().unique(),
    placedAt: (0, pg_core_1.timestamp)('placed_at', { withTimezone: true }).defaultNow().notNull(),
    settledAt: (0, pg_core_1.timestamp)('settled_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userMarketIdx: (0, pg_core_1.index)('bet_user_market_idx').on(table.userId, table.marketId),
    statusIdx: (0, pg_core_1.index)('bet_status_idx').on(table.status),
}));
// 8. Results Table
exports.results = (0, pg_core_1.pgTable)('results', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    marketId: (0, pg_core_1.uuid)('market_id')
        .notNull()
        .references(() => exports.markets.id, { onDelete: 'cascade' }),
    resultDate: (0, pg_core_1.varchar)('result_date', { length: 20 }).notNull(), // YYYY-MM-DD
    resultValue: (0, pg_core_1.varchar)('result_value', { length: 50 }).notNull(), // e.g. "358-62-480"
    openPatti: (0, pg_core_1.varchar)('open_patti', { length: 10 }),
    openAnk: (0, pg_core_1.varchar)('open_ank', { length: 5 }),
    closeAnk: (0, pg_core_1.varchar)('close_ank', { length: 5 }),
    closePatti: (0, pg_core_1.varchar)('close_patti', { length: 10 }),
    status: (0, pg_core_1.varchar)('status', { length: 30 }).default('PUBLISHED').notNull(),
    submittedBy: (0, pg_core_1.uuid)('submitted_by').references(() => exports.users.id),
    approvedBy: (0, pg_core_1.uuid)('approved_by').references(() => exports.users.id),
    publishedBy: (0, pg_core_1.uuid)('published_by').references(() => exports.users.id),
    publishedAt: (0, pg_core_1.timestamp)('published_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// 9. Wallets Table
exports.wallets = (0, pg_core_1.pgTable)('wallets', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' })
        .unique(),
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).default('INR').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// 10. Immutable Ledger Entries Table
exports.ledgerEntries = (0, pg_core_1.pgTable)('ledger_entries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    walletId: (0, pg_core_1.uuid)('wallet_id')
        .notNull()
        .references(() => exports.wallets.id, { onDelete: 'cascade' }),
    transactionId: (0, pg_core_1.uuid)('transaction_id'),
    entryType: (0, exports.ledgerEntryTypeEnum)('entry_type').notNull(), // CREDIT | DEBIT
    balanceType: (0, exports.balanceTypeEnum)('balance_type').notNull(), // CASH | BONUS | LOCKED
    amountMinor: (0, pg_core_1.bigint)('amount_minor', { mode: 'number' }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).default('INR').notNull(),
    referenceType: (0, pg_core_1.varchar)('reference_type', { length: 50 }),
    referenceId: (0, pg_core_1.varchar)('reference_id', { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    walletIdx: (0, pg_core_1.index)('ledger_wallet_idx').on(table.walletId),
    createdAtIdx: (0, pg_core_1.index)('ledger_created_at_idx').on(table.createdAt),
    referenceUniqueIdx: (0, pg_core_1.uniqueIndex)('ledger_reference_uniq').on(table.referenceType, table.referenceId),
}));
// 11. Transactions Table
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    type: (0, exports.transactionTypeEnum)('type').notNull(),
    status: (0, exports.transactionStatusEnum)('status').default('COMPLETED').notNull(),
    amountMinor: (0, pg_core_1.bigint)('amount_minor', { mode: 'number' }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).default('INR').notNull(),
    externalReference: (0, pg_core_1.text)('external_reference'),
    idempotencyKey: (0, pg_core_1.varchar)('idempotency_key', { length: 100 }).unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
});
// 12. Bonus Campaigns Table
exports.bonusCampaigns = (0, pg_core_1.pgTable)('bonus_campaigns', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 150 }).notNull(),
    amountMinor: (0, pg_core_1.bigint)('amount_minor', { mode: 'number' }).notNull(), // ₹100
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).default('INR').notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// 13. Bonus Claims Table
exports.bonusClaims = (0, pg_core_1.pgTable)('bonus_claims', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    campaignId: (0, pg_core_1.uuid)('campaign_id')
        .notNull()
        .references(() => exports.bonusCampaigns.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    amountMinor: (0, pg_core_1.bigint)('amount_minor', { mode: 'number' }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 30 }).default('CLAIMED').notNull(),
    claimedAt: (0, pg_core_1.timestamp)('claimed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userCampaignUnique: (0, pg_core_1.uniqueIndex)('user_campaign_uniq').on(table.campaignId, table.userId),
}));
// 14. Withdrawals Table
exports.withdrawals = (0, pg_core_1.pgTable)('withdrawals', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    amountMinor: (0, pg_core_1.bigint)('amount_minor', { mode: 'number' }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 30 }).default('PENDING').notNull(),
    providerReference: (0, pg_core_1.text)('provider_reference'),
    requestedAt: (0, pg_core_1.timestamp)('requested_at', { withTimezone: true }).defaultNow().notNull(),
    processedAt: (0, pg_core_1.timestamp)('processed_at', { withTimezone: true }),
});
// 15. Notifications Table
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 200 }).notNull(),
    body: (0, pg_core_1.text)('body').notNull(),
    readAt: (0, pg_core_1.timestamp)('read_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// 16. Support Tickets Table
exports.supportTickets = (0, pg_core_1.pgTable)('support_tickets', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    subject: (0, pg_core_1.varchar)('subject', { length: 200 }).notNull(),
    status: (0, exports.ticketStatusEnum)('status').default('OPEN').notNull(),
    priority: (0, exports.ticketPriorityEnum)('priority').default('MEDIUM').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// 17. Support Messages Table
exports.supportMessages = (0, pg_core_1.pgTable)('support_messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    ticketId: (0, pg_core_1.uuid)('ticket_id')
        .notNull()
        .references(() => exports.supportTickets.id, { onDelete: 'cascade' }),
    senderId: (0, pg_core_1.uuid)('sender_id').notNull(),
    senderRole: (0, exports.roleEnum)('sender_role').default('USER').notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// 18. Audit Logs Table
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    actorId: (0, pg_core_1.uuid)('actor_id'),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }).notNull(),
    entityId: (0, pg_core_1.varchar)('entity_id', { length: 100 }),
    metadata: (0, pg_core_1.text)('metadata'), // JSON stringified metadata
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// 19. System Settings Table
exports.systemSettings = (0, pg_core_1.pgTable)('system_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    ownerUpiId: (0, pg_core_1.varchar)('owner_upi_id', { length: 100 }).default('owner@upi').notNull(),
    ownerName: (0, pg_core_1.varchar)('owner_name', { length: 100 }).default('Lucky 777').notNull(),
    supportWhatsapp: (0, pg_core_1.varchar)('support_whatsapp', { length: 20 }).default('+919380347013').notNull(),
    depositEnabled: (0, pg_core_1.boolean)('deposit_enabled').default(true).notNull(),
    withdrawalEnabled: (0, pg_core_1.boolean)('withdrawal_enabled').default(true).notNull(),
    minWithdrawalMinor: (0, pg_core_1.bigint)('min_withdrawal_minor', { mode: 'number' }).default(500).notNull(),
    maxWithdrawalMinor: (0, pg_core_1.bigint)('max_withdrawal_minor', { mode: 'number' }).default(50000).notNull(),
    manualProcessing: (0, pg_core_1.boolean)('manual_processing').default(true).notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// 20. Deposits Table (Manual UPI)
exports.deposits = (0, pg_core_1.pgTable)('deposits', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    amountMinor: (0, pg_core_1.bigint)('amount_minor', { mode: 'number' }).notNull(),
    status: (0, exports.transactionStatusEnum)('status').default('PENDING').notNull(),
    utr: (0, pg_core_1.varchar)('utr', { length: 100 }).notNull().unique(),
    rejectionReason: (0, pg_core_1.text)('rejection_reason'),
    requestedAt: (0, pg_core_1.timestamp)('requested_at', { withTimezone: true }).defaultNow().notNull(),
    processedAt: (0, pg_core_1.timestamp)('processed_at', { withTimezone: true }),
    processedBy: (0, pg_core_1.uuid)('processed_by').references(() => exports.users.id),
});
// Relations definitions
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    mpin: one(exports.mpins, { fields: [exports.users.id], references: [exports.mpins.userId] }),
    wallet: one(exports.wallets, { fields: [exports.users.id], references: [exports.wallets.userId] }),
    bets: many(exports.bets),
    sessions: many(exports.sessions),
    notifications: many(exports.notifications),
    supportTickets: many(exports.supportTickets),
    transactions: many(exports.transactions),
    deposits: many(exports.deposits),
    withdrawals: many(exports.withdrawals),
}));
exports.walletsRelations = (0, drizzle_orm_1.relations)(exports.wallets, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.wallets.userId], references: [exports.users.id] }),
    ledgerEntries: many(exports.ledgerEntries),
}));
exports.marketsRelations = (0, drizzle_orm_1.relations)(exports.markets, ({ many }) => ({
    schedules: many(exports.marketSchedules),
    bets: many(exports.bets),
    results: many(exports.results),
}));
// 13. App Settings Table (Admin configurable)
exports.appSettings = (0, pg_core_1.pgTable)('app_settings', {
    id: (0, pg_core_1.varchar)('id', { length: 50 }).primaryKey(), // 'global'
    adminPassword: (0, pg_core_1.text)('admin_password').notNull().default('Admin@123'),
    supportNumber: (0, pg_core_1.varchar)('support_number', { length: 20 }),
    upiId: (0, pg_core_1.varchar)('upi_id', { length: 100 }),
    upiQrCodeUrl: (0, pg_core_1.text)('upi_qr_code_url'),
    welcomeBonusAmount: (0, pg_core_1.integer)('welcome_bonus_amount').default(100),
    minDepositAmount: (0, pg_core_1.integer)('min_deposit_amount').default(500),
    minWithdrawalAmount: (0, pg_core_1.integer)('min_withdrawal_amount').default(1000),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
