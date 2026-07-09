CREATE TABLE "prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentor" varchar(50) NOT NULL,
	"version" integer DEFAULT 1,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "prompts_mentor_unique" UNIQUE("mentor")
);
