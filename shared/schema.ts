import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  location: text("location"),
  cowRate: real("cow_rate").notNull(),
  buffaloRate: real("buffalo_rate").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  location: text("location"),
  cowRate: real("cow_rate").notNull(),
  buffaloRate: real("buffalo_rate").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milkTransactions = pgTable("milk_transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'receive' or 'send'
  vendorId: integer("vendor_id").references(() => vendors.id),
  customerId: integer("customer_id").references(() => customers.id),
  milkType: text("milk_type").notNull(), // 'cow' or 'buffalo'
  quantity: real("quantity").notNull(),
  fat: real("fat"),
  snf: real("snf"),
  rate: real("rate").notNull(),
  totalAmount: real("total_amount").notNull(),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'received' or 'paid'
  vendorId: integer("vendor_id").references(() => vendors.id),
  customerId: integer("customer_id").references(() => customers.id),
  amount: real("amount").notNull(),
  method: text("method").notNull(), // 'cash', 'bank', 'cheque'
  reference: text("reference"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertMilkTransactionSchema = createInsertSchema(milkTransactions).omit({
  id: true,
  createdAt: true,
}).extend({
  vendorId: z.string().optional().nullable().transform(val => val ? parseInt(val, 10) : null),
  customerId: z.string().optional().nullable().transform(val => val ? parseInt(val, 10) : null),
  quantity: z.number().or(z.string().transform(val => parseFloat(val))),
  rate: z.number().or(z.string().transform(val => parseFloat(val))),
  totalAmount: z.number().or(z.string().transform(val => parseFloat(val))),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertMilkTransaction = z.infer<typeof insertMilkTransactionSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type MilkTransaction = typeof milkTransactions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
