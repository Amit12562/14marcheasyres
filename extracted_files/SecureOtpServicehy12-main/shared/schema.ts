import { pgTable, text, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletBalance: decimal("wallet_balance").notNull().default("0"),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const rechargeRequests = pgTable("recharge_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  utrNumber: text("utr_number").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: text("created_at").notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  price: decimal("price").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRechargeRequestSchema = createInsertSchema(rechargeRequests).pick({
  amount: true,
  utrNumber: true,
});

export const serviceCategories = [
  "Social Media",
  "E-commerce",
  "Banking & Payments",
  "Food Delivery",
  "Travel & Transport",
  "Entertainment",
  "Gaming",
  "Education",
  "Cloud Storage",
  "Jobs & Freelancing",
  "Crypto",
  "VPN",
  "Classifieds",
  "Government Services",
] as const;

export type ServiceCategory = typeof serviceCategories[number];

export const insertServiceSchema = createInsertSchema(services);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRechargeRequest = z.infer<typeof insertRechargeRequestSchema>;
export type RechargeRequest = typeof rechargeRequests.$inferSelect;
export type Service = typeof services.$inferSelect;