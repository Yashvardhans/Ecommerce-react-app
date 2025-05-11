import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  phone: true,
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  icon: text("icon"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  image: true,
  icon: true,
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  images: text("images").array(),
  categoryId: integer("category_id").references(() => categories.id),
  stock: integer("stock").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  numReviews: integer("num_reviews").default(0),
  isFeatured: boolean("is_featured").default(false),
  isNew: boolean("is_new").default(false),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  price: true,
  comparePrice: true,
  image: true,
  images: true,
  categoryId: true,
  stock: true,
  rating: true,
  numReviews: true,
  isFeatured: true,
  isNew: true,
});

// Cart items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

// Orders schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: orderStatusEnum("status").notNull().default('pending'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZipCode: text("shipping_zip_code").notNull(),
  shippingCountry: text("shipping_country").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  total: true,
  shippingAddress: true,
  shippingCity: true,
  shippingState: true,
  shippingZipCode: true,
  shippingCountry: true,
  paymentMethod: true,
});

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
