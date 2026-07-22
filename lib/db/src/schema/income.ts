import { pgTable, serial, text, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const incomeTable = pgTable("income", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  source: text("source").notNull().default(""),
  date: date("date").notNull(),
  category: text("category").notNull().default("other"),
});

export const insertIncomeSchema = createInsertSchema(incomeTable).omit({ id: true });
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomeTable.$inferSelect;
