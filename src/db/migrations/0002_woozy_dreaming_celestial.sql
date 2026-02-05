CREATE TABLE "user_data" (
	"id" text PRIMARY KEY NOT NULL,
	"reward_points" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "resolved_by" text;--> statement-breakpoint
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;