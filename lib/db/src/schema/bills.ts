import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const billsTable = pgTable("bills", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("miscellaneous"),
});

export const insertBillSchema = createInsertSchema(billsTable).omit({ id: true });
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof billsTable.$inferSelect;
