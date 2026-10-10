DO $$ BEGIN
 CREATE TYPE "public"."balance_type" AS ENUM('CASH', 'BONUS', 'LOCKED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."bet_status" AS ENUM('ACTIVE', 'WON', 'LOST', 'CANCELLED', 'SETTLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ledger_entry_type" AS ENUM('CREDIT', 'DEBIT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."market_status" AS ENUM('OPEN', 'CLOSED', 'SUSPENDED', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN', 'SUPPORT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REJECTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transaction_type" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'BET_PLACED', 'BET_WON', 'BET_REFUND', 'WELCOME_BONUS', 'PROMOTIONAL_BONUS', 'ADMIN_ADJUSTMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'SUSPENDED', 'BLOCKED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(100),
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"market_id" uuid NOT NULL,
	"bet_type_code" varchar(50) NOT NULL,
	"selection" varchar(50) NOT NULL,
	"session" varchar(20),
	"amount_minor" bigint NOT NULL,
	"status" "bet_status" DEFAULT 'ACTIVE' NOT NULL,
	"idempotency_key" varchar(100) NOT NULL,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bets_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bonus_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bonus_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"status" varchar(30) DEFAULT 'CLAIMED' NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"transaction_id" uuid,
	"entry_type" "ledger_entry_type" NOT NULL,
	"balance_type" "balance_type" NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"reference_type" varchar(50),
	"reference_id" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"opens_at" varchar(20) NOT NULL,
	"closes_at" varchar(20) NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"description" text,
	"status" "market_status" DEFAULT 'OPEN' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "markets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mpins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mpin_hash" text NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mpins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"phone" varchar(20) NOT NULL,
	"otp_hash" text NOT NULL,
	"purpose" varchar(50) DEFAULT 'LOGIN' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"result_date" varchar(20) NOT NULL,
	"result_value" varchar(50) NOT NULL,
	"open_patti" varchar(10),
	"open_ank" varchar(5),
	"close_ank" varchar(5),
	"close_patti" varchar(10),
	"status" varchar(30) DEFAULT 'PUBLISHED' NOT NULL,
	"submitted_by" uuid,
	"approved_by" uuid,
	"published_by" uuid,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_role" "role" DEFAULT 'USER' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subject" varchar(200) NOT NULL,
	"status" "ticket_status" DEFAULT 'OPEN' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'MEDIUM' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'COMPLETED' NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"external_reference" text,
	"idempotency_key" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "transactions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"display_name" varchar(100),
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"phone_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING' NOT NULL,
	"provider_reference" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bets" ADD CONSTRAINT "bets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bets" ADD CONSTRAINT "bets_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_campaign_id_bonus_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."bonus_campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "market_schedules" ADD CONSTRAINT "market_schedules_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mpins" ADD CONSTRAINT "mpins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bet_user_market_idx" ON "bets" ("user_id","market_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bet_status_idx" ON "bets" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_campaign_uniq" ON "bonus_claims" ("campaign_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ledger_wallet_idx" ON "ledger_entries" ("wallet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ledger_created_at_idx" ON "ledger_entries" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otp_phone_idx" ON "otp_verifications" ("phone");