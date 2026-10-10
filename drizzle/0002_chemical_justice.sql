CREATE TABLE IF NOT EXISTS "app_settings" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"admin_password" text DEFAULT 'Admin@123' NOT NULL,
	"support_number" varchar(20),
	"upi_id" varchar(100),
	"upi_qr_code_url" text,
	"welcome_bonus_amount" integer DEFAULT 100,
	"min_deposit_amount" integer DEFAULT 500,
	"min_withdrawal_amount" integer DEFAULT 1000,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "support_whatsapp" varchar(20) DEFAULT '+919380347013' NOT NULL;