CREATE TABLE "links" (
	"id" uuid PRIMARY KEY,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"code" varchar(20) NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "links_user_id_idx" ON "links" ("user_id");--> statement-breakpoint
CREATE INDEX "links_code_idx" ON "links" ("code");