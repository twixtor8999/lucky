CREATE TABLE IF NOT EXISTS "deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"utr" varchar(100) NOT NULL,
	"rejection_reason" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"processed_by" uuid,
	CONSTRAINT "deposits_utr_unique" UNIQUE("utr")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_upi_id" varchar(100) DEFAULT 'owner@upi' NOT NULL,
	"owner_name" varchar(100) DEFAULT 'Lucky 777' NOT NULL,
	"deposit_enabled" boolean DEFAULT true NOT NULL,
	"withdrawal_enabled" boolean DEFAULT true NOT NULL,
	"min_withdrawal_minor" bigint DEFAULT 500 NOT NULL,
	"max_withdrawal_minor" bigint DEFAULT 50000 NOT NULL,
	"manual_processing" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deposits" ADD CONSTRAINT "deposits_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ledger_reference_uniq" ON "ledger_entries" ("reference_type","reference_id");