import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  bigint,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'SUPPORT']);
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'SUSPENDED', 'BLOCKED']);
export const marketStatusEnum = pgEnum('market_status', ['OPEN', 'CLOSED', 'SUSPENDED', 'ARCHIVED']);
export const betStatusEnum = pgEnum('bet_status', ['ACTIVE', 'WON', 'LOST', 'CANCELLED', 'SETTLED']);
export const balanceTypeEnum = pgEnum('balance_type', ['CASH', 'BONUS', 'LOCKED']);
export const ledgerEntryTypeEnum = pgEnum('ledger_entry_type', ['CREDIT', 'DEBIT']);
export const transactionTypeEnum = pgEnum('transaction_type', [
  'DEPOSIT',
  'WITHDRAWAL',
  'BET_PLACED',
  'BET_WON',
  'BET_REFUND',
  'WELCOME_BONUS',
  'PROMOTIONAL_BONUS',
  'ADMIN_ADJUSTMENT',
]);
export const transactionStatusEnum = pgEnum('transaction_status', ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED']);
export const ticketStatusEnum = pgEnum('ticket_status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['LOW', 'MEDIUM', 'HIGH']);

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }),
  status: userStatusEnum('status').default('ACTIVE').notNull(),
  role: roleEnum('role').default('USER').notNull(),
  phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),
  
  // Payment Details
  upiId: varchar('upi_id', { length: 100 }),
  bankAccountName: varchar('bank_account_name', { length: 100 }),
  bankAccountNumber: varchar('bank_account_number', { length: 50 }),
  bankIfsc: varchar('bank_ifsc', { length: 20 }),
  bankName: varchar('bank_name', { length: 100 }),
  welcomeBonusStatus: varchar('welcome_bonus_status', { length: 30 }).default('NOT PAID').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. MPINs Table
export const mpins = pgTable('mpins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  mpinHash: text('mpin_hash').notNull(),
  failedAttempts: integer('failed_attempts').default(0).notNull(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. OTP Verifications Table
export const otpVerifications = pgTable(
  'otp_verifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    phone: varchar('phone', { length: 20 }).notNull(),
    otpHash: text('otp_hash').notNull(),
    purpose: varchar('purpose', { length: 50 }).default('LOGIN').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attemptCount: integer('attempt_count').default(0).notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index('otp_phone_idx').on(table.phone),
  })
);

// 4. Sessions Table
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Markets Table
export const markets = pgTable('markets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  description: text('description'),
  status: marketStatusEnum('status').default('OPEN').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Kolkata').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

// 6. Market Schedules Table
export const marketSchedules = pgTable('market_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  marketId: uuid('market_id')
    .notNull()
    .references(() => markets.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sun, 6 = Sat
  opensAt: varchar('opens_at', { length: 20 }).notNull(), // e.g. "11:00 AM"
  closesAt: varchar('closes_at', { length: 20 }).notNull(), // e.g. "12:00 PM"
  timezone: varchar('timezone', { length: 50 }).default('Asia/Kolkata').notNull(),
  active: boolean('active').default(true).notNull(),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).defaultNow().notNull(),
  effectiveUntil: timestamp('effective_until', { withTimezone: true }),
});

// 7. Bets Table
export const bets = pgTable(
  'bets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    betTypeCode: varchar('bet_type_code', { length: 50 }).notNull(),
    selection: varchar('selection', { length: 50 }).notNull(),
    session: varchar('session', { length: 20 }), // "OPEN" | "CLOSE"
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(), // in paise or Rupees
    status: betStatusEnum('status').default('ACTIVE').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull().unique(),
    placedAt: timestamp('placed_at', { withTimezone: true }).defaultNow().notNull(),
    settledAt: timestamp('settled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userMarketIdx: index('bet_user_market_idx').on(table.userId, table.marketId),
    statusIdx: index('bet_status_idx').on(table.status),
  })
);

// 8. Results Table
export const results = pgTable('results', {
  id: uuid('id').defaultRandom().primaryKey(),
  marketId: uuid('market_id')
    .notNull()
    .references(() => markets.id, { onDelete: 'cascade' }),
  resultDate: varchar('result_date', { length: 20 }).notNull(), // YYYY-MM-DD
  resultValue: varchar('result_value', { length: 50 }).notNull(), // e.g. "358-62-480"
  openPatti: varchar('open_patti', { length: 10 }),
  openAnk: varchar('open_ank', { length: 5 }),
  closeAnk: varchar('close_ank', { length: 5 }),
  closePatti: varchar('close_patti', { length: 10 }),
  status: varchar('status', { length: 30 }).default('PUBLISHED').notNull(),
  submittedBy: uuid('submitted_by').references(() => users.id),
  approvedBy: uuid('approved_by').references(() => users.id),
  publishedBy: uuid('published_by').references(() => users.id),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 9. Wallets Table
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 10. Immutable Ledger Entries Table
export const ledgerEntries = pgTable(
  'ledger_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    transactionId: uuid('transaction_id'),
    entryType: ledgerEntryTypeEnum('entry_type').notNull(), // CREDIT | DEBIT
    balanceType: balanceTypeEnum('balance_type').notNull(), // CASH | BONUS | LOCKED
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    currency: varchar('currency', { length: 10 }).default('INR').notNull(),
    referenceType: varchar('reference_type', { length: 50 }),
    referenceId: varchar('reference_id', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    walletIdx: index('ledger_wallet_idx').on(table.walletId),
    createdAtIdx: index('ledger_created_at_idx').on(table.createdAt),
    referenceUniqueIdx: uniqueIndex('ledger_reference_uniq').on(table.referenceType, table.referenceId),
  })
);

// 11. Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum('type').notNull(),
  status: transactionStatusEnum('status').default('COMPLETED').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  externalReference: text('external_reference'),
  idempotencyKey: varchar('idempotency_key', { length: 100 }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// 12. Bonus Campaigns Table
export const bonusCampaigns = pgTable('bonus_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(), // ₹100
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  active: boolean('active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 13. Bonus Claims Table
export const bonusClaims = pgTable(
  'bonus_claims',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => bonusCampaigns.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    status: varchar('status', { length: 30 }).default('CLAIMED').notNull(),
    claimedAt: timestamp('claimed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCampaignUnique: uniqueIndex('user_campaign_uniq').on(table.campaignId, table.userId),
  })
);

// 14. Withdrawals Table
export const withdrawals = pgTable('withdrawals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
  status: varchar('status', { length: 30 }).default('PENDING').notNull(),
  providerReference: text('provider_reference'),
  
  actualAmountMinor: bigint('actual_amount_minor', { mode: 'number' }),
  paymentReference: varchar('payment_reference', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentNote: text('payment_note'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

// 15. Notifications Table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 16. Support Tickets Table
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 200 }).notNull(),
  status: ticketStatusEnum('status').default('OPEN').notNull(),
  priority: ticketPriorityEnum('priority').default('MEDIUM').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 17. Support Messages Table
export const supportMessages = pgTable('support_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => supportTickets.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull(),
  senderRole: roleEnum('sender_role').default('USER').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 18. Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id'),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }),
  metadata: text('metadata'), // JSON stringified metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 19. System Settings Table
export const systemSettings = pgTable('system_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerUpiId: varchar('owner_upi_id', { length: 100 }).default('owner@upi').notNull(),
  ownerName: varchar('owner_name', { length: 100 }).default('Lucky 777').notNull(),
  supportWhatsapp: varchar('support_whatsapp', { length: 20 }).default('+919380347013').notNull(),
  depositEnabled: boolean('deposit_enabled').default(true).notNull(),
  withdrawalEnabled: boolean('withdrawal_enabled').default(true).notNull(),
  minWithdrawalMinor: bigint('min_withdrawal_minor', { mode: 'number' }).default(500).notNull(),
  maxWithdrawalMinor: bigint('max_withdrawal_minor', { mode: 'number' }).default(50000).notNull(),
  manualProcessing: boolean('manual_processing').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 20. Deposits Table (Manual UPI)
export const deposits = pgTable('deposits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
  status: transactionStatusEnum('status').default('PENDING').notNull(),
  utr: varchar('utr', { length: 100 }).notNull().unique(),
  rejectionReason: text('rejection_reason'),
  
  actualAmountMinor: bigint('actual_amount_minor', { mode: 'number' }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  processedBy: uuid('processed_by').references(() => users.id),
});

// Relations definitions
export const usersRelations = relations(users, ({ one, many }) => ({
  mpin: one(mpins, { fields: [users.id], references: [mpins.userId] }),
  wallet: one(wallets, { fields: [users.id], references: [wallets.userId] }),
  bets: many(bets),
  sessions: many(sessions),
  notifications: many(notifications),
  supportTickets: many(supportTickets),
  transactions: many(transactions),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  ledgerEntries: many(ledgerEntries),
}));

export const marketsRelations = relations(markets, ({ many }) => ({
  schedules: many(marketSchedules),
  bets: many(bets),
  results: many(results),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  market: one(markets, { fields: [results.marketId], references: [markets.id] }),
}));

export const marketSchedulesRelations = relations(marketSchedules, ({ one }) => ({
  market: one(markets, { fields: [marketSchedules.marketId], references: [markets.id] }),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  market: one(markets, { fields: [bets.marketId], references: [markets.id] }),
  user: one(users, { fields: [bets.userId], references: [users.id] }),
}));

// 13. App Settings Table (Admin configurable)
export const appSettings = pgTable('app_settings', {
  id: varchar('id', { length: 50 }).primaryKey(), // 'global'
  adminPassword: text('admin_password').notNull().default('Admin@123'),
  supportNumber: varchar('support_number', { length: 20 }),
  upiId: varchar('upi_id', { length: 100 }),
  upiQrCodeUrl: text('upi_qr_code_url'),
  welcomeBonusAmount: integer('welcome_bonus_amount').default(100),
  minDepositAmount: integer('min_deposit_amount').default(500),
  minWithdrawalAmount: integer('min_withdrawal_amount').default(1000),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
