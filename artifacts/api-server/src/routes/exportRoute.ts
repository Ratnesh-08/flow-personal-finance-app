import { Router } from "express";
import { db, incomeTable, billsTable } from "@workspace/db";
import { ExportCsvQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/export/csv", async (req, res): Promise<void> => {
  const parsed = ExportCsvQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type } = parsed.data;
  const lines: string[] = [];

  if (type === "income" || type === "all") {
    const rows = await db.select().from(incomeTable).orderBy(incomeTable.date);
    lines.push("type,id,source,amount,date,category");
    for (const r of rows) {
      lines.push(`income,${r.id},"${r.source}",${r.amount},${r.date},${r.category}`);
    }
  }

  if (type === "bills" || type === "all") {
    const rows = await db.select().from(billsTable).orderBy(billsTable.name);
    if (type === "all") lines.push("");
    lines.push("type,id,name,amount,category");
    for (const r of rows) {
      lines.push(`bill,${r.id},"${r.name}",${r.amount},${r.category}`);
    }
  }

  const csv = lines.join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="flow-export-${type}.csv"`);
  res.send(csv);
});

export default router;
