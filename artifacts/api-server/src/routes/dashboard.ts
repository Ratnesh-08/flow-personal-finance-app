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

  // Ensure settings row exists
  let settings = settingsRows[0];
  if (!settings) {
    const [row] = await db.insert(settingsTable).values({}).returning();
    settings = row;
  }

  // Baseline: average of up to 6 most recent income entries
  const recent = incomeRows.slice(0, 6);
  const baselineIncome =
    recent.length > 0
      ? recent.reduce((s, e) => s + Number(e.amount), 0) / recent.length
      : 0;

  const totalBills = billRows.reduce((s, b) => s + Number(b.amount), 0);
  const bufferPct = Number(settings.bufferPct);
  const bufferReserve = baselineIncome * bufferPct;
  const safeToSpend = Math.max(0, baselineIncome - totalBills - bufferReserve);
  const bufferBalance = Number(settings.bufferBalance);
  const bufferGoalMonths = Number(settings.bufferGoalMonths);
  const bufferGoal = baselineIncome * bufferGoalMonths;

  // Recent activity: merge income + bills, sort by date desc, top 6
  const incomeActivity = incomeRows.slice(0, 10).map((e) => ({
    id: e.id,
    type: "income" as const,
    label: e.source || "Income",
    amount: Number(e.amount),
    date: e.date,
  }));

  const billActivity = billRows.map((b) => ({
    id: b.id,
    type: "bill" as const,
    label: b.name || "Bill",
    amount: Number(b.amount),
    date: null,
  }));

  const allActivity = [...incomeActivity, ...billActivity]
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 6);

  res.json(
    GetDashboardResponse.parse({
      safeToSpend,
      baselineIncome,
      totalBills,
      bufferBalance,
      bufferGoal,
      bufferPct,
      bufferGoalMonths,
      onboarded: settings.onboarded,
      recentActivity: allActivity,
    })
  );
});

export default router;
