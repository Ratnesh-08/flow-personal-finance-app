import { pgTable, serial, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  bufferPct: numeric("buffer_pct", { precision: 5, scale: 4 }).notNull().default("0.10"),
  bufferBalance: numeric("buffer_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  bufferGoalMonths: numeric("buffer_goal_months", { precision: 4, scale: 2 }).notNull().default("1"),
  onboarded: boolean("onboarded").notNull().default(false),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
