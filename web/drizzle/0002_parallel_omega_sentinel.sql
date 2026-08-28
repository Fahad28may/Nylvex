CREATE TABLE "whatsapp_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_access_id" uuid NOT NULL,
	"status" text DEFAULT 'not_connected' NOT NULL,
	"waba_id" text,
	"phone_number_id" text,
	"display_phone_number" text,
	"business_display_name" text,
	"failure_reason" text,
	"connected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "whatsapp_integrations" ADD CONSTRAINT "whatsapp_integrations_product_access_id_product_access_id_fk" FOREIGN KEY ("product_access_id") REFERENCES "public"."product_access"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "whatsapp_integrations_product_access_idx" ON "whatsapp_integrations" USING btree ("product_access_id");