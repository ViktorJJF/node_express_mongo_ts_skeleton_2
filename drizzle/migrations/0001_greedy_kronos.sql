ALTER TABLE "bots" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "bots" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "forgot_passwords" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "forgot_passwords" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_access" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "user_access" ALTER COLUMN "id" DROP DEFAULT;