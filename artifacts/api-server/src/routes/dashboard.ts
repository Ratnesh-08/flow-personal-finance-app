import { Router } from "express";
import { desc } from "drizzle-orm";
import { db, incomeTable, billsTable, settingsTable } from "@workspace/db";
import { GetDashboardResponse } from "@workspace/api-zod";

const router = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  const [incomeRows, billRows, settingsRows] = await Promise.all([
    db.select().from(incomeTable).orderBy(desc(incomeTable.date)),
    db.select().from(billsTable).orderBy(billsTable.name),
    db.select().from(settingsTable),
  ]);

  let settings = settingsRows[0];
  if (!settings) {
    const [row] = await db.insert(settingsTable).values({}).returning();
    settings = row;
  }

  const recent = incomeRows.slice(0, 6);
  const baselineIncome = recent.length > 0
    ? recent.reduce((s, e) => s + Number(e.amount), 0) / recent.length
    : 0;

  const totalBills = billRows.reduce((s, b) => s + Number(b.amount), 0);
  const bufferPct = Number(settings.bufferPct);
  const bufferReserve = baselineIncome * bufferPct;
  const safeToSpend = Math.max(0, baselineIncome - totalBills - bufferReserve);
  const bufferBalance = Number(settings.bufferBalance);
  const bufferGoalMonths = Number(settings.bufferGoalMonths);
  const bufferGoal = baselineIncome * bufferGoalMonths;

  // Insights
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemainingInMonth = lastDay - now.getDate() + 1;
  const dailyBudget = daysRemainingInMonth > 0 ? safeToSpend / daysRemainingInMonth : 0;
  const savingsPct = baselineIncome > 0 ? (bufferReserve / baselineIncome) * 100 : 0;
  const spendingRate = baselineIncome > 0 ? (totalBills / baselineIncome) * 100 : 0;
  const projectedMonthEnd = Math.max(0, safeToSpend - (dailyBudget * daysRemainingInMonth * 0.8));

  let budgetHealth: "excellent" | "good" | "fair" | "tight" = "tight";
  const ratio = baselineIncome > 0 ? safeToSpend / baselineIncome : 0;
  if (ratio >= 0.4) budgetHealth = "excellent";
  else if (ratio >= 0.25) budgetHealth = "good";
  else if (ratio >= 0.1) budgetHealth = "fair";

  // Recent activity
  const incomeActivity = incomeRows.slice(0, 10).map((e) => ({
    id: e.id, type: "income" as const, label: e.source || "Income",
    amount: Number(e.amount), date: e.date, category: e.category,
  }));
  const billActivity = billRows.map((b) => ({
    id: b.id, type: "bill" as const, label: b.name || "Bill",
    amount: Number(b.amount), date: null, category: b.category,
  }));

  const allActivity = [...incomeActivity, ...billActivity]
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 6);

  res.json(GetDashboardResponse.parse({
    safeToSpend, baselineIncome, totalBills,
    bufferBalance, bufferGoal, bufferPct, bufferGoalMonths,
    onboarded: settings.onboarded,
    recentActivity: allActivity,
    insights: { dailyBudget, daysRemainingInMonth, savingsPct, spendingRate, projectedMonthEnd, budgetHealth },
  }));
});

export default router;
