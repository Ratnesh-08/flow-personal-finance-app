import { Router } from "express";
import { gte } from "drizzle-orm";
import { db, incomeTable, billsTable } from "@workspace/db";
import { GetMonthlyAnalyticsQueryParams, GetMonthlyAnalyticsResponse } from "@workspace/api-zod";

const router = Router();

router.get("/analytics/monthly", async (req, res): Promise<void> => {
  const parsed = GetMonthlyAnalyticsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const monthsBack = parsed.data.months ?? 6;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
  const startStr = startDate.toISOString().split("T")[0];

  const [incomeRows, billRows] = await Promise.all([
    db
      .select()
      .from(incomeTable)
      .where(gte(incomeTable.date, startStr)),
    db.select().from(billsTable),
  ]);

  const totalBills = billRows.reduce((s, b) => s + Number(b.amount), 0);

  // Build monthly buckets
  const monthMap = new Map<string, { income: number; bills: number }>();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { income: 0, bills: totalBills });
  }

  for (const row of incomeRows) {
    const key = row.date.slice(0, 7); // YYYY-MM
    if (monthMap.has(key)) {
      monthMap.get(key)!.income += Number(row.amount);
    }
  }

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const result = Array.from(monthMap.entries()).map(([key, data]) => {
    const [year, month] = key.split("-").map(Number);
    return {
      month,
      year,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
      income: data.income,
      bills: data.bills,
    };
  });

  res.json(GetMonthlyAnalyticsResponse.parse(result));
});

export default router;
