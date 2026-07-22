import { Router } from "express";
import { db, incomeTable, billsTable, settingsTable, savingsGoalsTable, recurringItemsTable } from "@workspace/db";

const router = Router();

const DEMO_INCOME = [
  { amount: "4200", source: "Acme Corp", date: "2026-05-15", category: "freelance" },
  { amount: "3800", source: "Design Studio", date: "2026-05-28", category: "freelance" },
  { amount: "4500", source: "Acme Corp", date: "2026-06-18", category: "freelance" },
  { amount: "1200", source: "Stock Dividends", date: "2026-06-30", category: "investment" },
  { amount: "4100", source: "Acme Corp", date: "2026-07-10", category: "freelance" },
  { amount: "800", source: "Side Project", date: "2026-07-18", category: "freelance" },
];

const DEMO_BILLS = [
  { amount: "1400", name: "Rent", category: "housing" },
  { amount: "80", name: "Internet", category: "transport" },
  { amount: "16", name: "Spotify", category: "entertainment" },
  { amount: "3", name: "iCloud", category: "miscellaneous" },
  { amount: "120", name: "Groceries", category: "food" },
  { amount: "60", name: "Phone Plan", category: "miscellaneous" },
];

const DEMO_GOALS = [
  { name: "Emergency Fund", targetAmount: "10000", currentAmount: "4200", deadline: "2026-12-31", completed: false },
  { name: "New Laptop", targetAmount: "2500", currentAmount: "1800", deadline: "2026-09-01", completed: false },
  { name: "Holiday Trip", targetAmount: "3000", currentAmount: "3000", deadline: null, completed: true },
];

const DEMO_RECURRING = [
  { type: "income" as const, name: "Monthly Retainer", amount: "2000", category: "freelance", frequency: "monthly" as const, startDate: "2026-01-01", active: true },
  { type: "bill" as const, name: "Gym Membership", amount: "45", category: "healthcare", frequency: "monthly" as const, startDate: "2026-01-01", active: true },
];

router.post("/demo/load", async (_req, res): Promise<void> => {
  // Clear existing data
  await db.delete(recurringItemsTable);
  await db.delete(savingsGoalsTable);
  await db.delete(billsTable);
  await db.delete(incomeTable);

  // Seed demo data
  await db.insert(incomeTable).values(DEMO_INCOME);
  await db.insert(billsTable).values(DEMO_BILLS);
  await db.insert(savingsGoalsTable).values(DEMO_GOALS.map(g => ({
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    deadline: g.deadline,
    completed: g.completed,
  })));
  await db.insert(recurringItemsTable).values(DEMO_RECURRING.map(r => ({
    type: r.type,
    name: r.name,
    amount: r.amount,
    category: r.category,
    frequency: r.frequency,
    startDate: r.startDate,
    active: r.active,
  })));

  // Ensure onboarded
  const existing = await db.select().from(settingsTable);
  if (existing.length > 0) {
    await db.update(settingsTable).set({ onboarded: true });
  } else {
    await db.insert(settingsTable).values({ onboarded: true });
  }

  res.json({ message: "Demo data loaded successfully" });
});

router.post("/demo/clear", async (_req, res): Promise<void> => {
  await db.delete(recurringItemsTable);
  await db.delete(savingsGoalsTable);
  await db.delete(billsTable);
  await db.delete(incomeTable);

  // Reset settings
  await db.delete(settingsTable);
  await db.insert(settingsTable).values({});

  res.json({ message: "All data cleared" });
});

export default router;
