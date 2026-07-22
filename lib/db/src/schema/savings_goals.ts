import { pgTable, serial, text, numeric, date, boolean, timestamp } from "drizzle-orm/pg-core";

export const savingsGoalsTable = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  deadline: date("deadline"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
