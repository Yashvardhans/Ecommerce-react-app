CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer,
    "product_id" integer,
    "quantity" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "icon" text,
    "image" text
);

CREATE TABLE IF NOT EXISTS "order_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_id" integer,
    "product_id" integer,
    "quantity" integer NOT NULL,
    "price" text NOT NULL
);

CREATE TYPE "order_status" AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE IF NOT EXISTS "orders" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer,
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "total" text NOT NULL,
    "shipping_address" text NOT NULL,
    "shipping_city" text NOT NULL,
    "shipping_state" text NOT NULL,
    "shipping_zip_code" text NOT NULL,
    "shipping_country" text NOT NULL,
    "payment_method" text NOT NULL,
    "created_at" timestamp
);

CREATE TABLE IF NOT EXISTS "products" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "description" text NOT NULL,
    "price" text NOT NULL,
    "compare_price" text,
    "image" text NOT NULL,
    "images" text[],
    "category_id" integer,
    "stock" integer NOT NULL,
    "rating" text,
    "num_reviews" integer,
    "is_featured" boolean,
    "is_new" boolean
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "username" text NOT NULL,
    "password" text NOT NULL,
    "email" text NOT NULL,
    "first_name" text,
    "last_name" text,
    "address" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "country" text,
    "phone" text,
    "is_admin" boolean
);

CREATE UNIQUE INDEX IF NOT EXISTS "category_slug_idx" ON "categories" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "product_slug_idx" ON "products" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "users" ("username");
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" ("email");

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;