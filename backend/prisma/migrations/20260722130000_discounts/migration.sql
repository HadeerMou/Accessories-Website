CREATE TYPE "discount_type" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

CREATE TABLE "discounts" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "type" "discount_type" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minimum_subtotal" DECIMAL(10,2),
    "starts_at" TIMESTAMP(6),
    "ends_at" TIMESTAMP(6),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "discounts_code_key" ON "discounts"("code");

ALTER TABLE "orders" ADD COLUMN "discount_id" UUID;
ALTER TABLE "orders" ADD COLUMN "discount_code" VARCHAR(100);
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
