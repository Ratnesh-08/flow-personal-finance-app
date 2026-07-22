import { pgTable, serial, text, numeric, date, boolean, timestamp } from "drizzle-orm/pg-core";

export const recurringItemsTable = pgTable("recurring_items", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'income' | 'bill'
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull().default("other"),
  frequency: text("frequency").notNull(), // 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: date("start_date").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
