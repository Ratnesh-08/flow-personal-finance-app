import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, incomeTable } from "@workspace/db";
import {
  CreateIncomeBody,
  CreateIncomeResponse,
  DeleteIncomeParams,
  ListIncomeResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/income", async (req, res): Promise<void> => {
  const rows = await db.select().from(incomeTable).orderBy(incomeTable.date);
  res.json(ListIncomeResponse.parse(rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    source: r.source,
    date: r.date,
  }))));
});

router.post("/income", async (req, res): Promise<void> => {
  const parsed = CreateIncomeBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid income body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { amount, source, date } = parsed.data;
  const [row] = await db
    .insert(incomeTable)
    .values({ amount: String(amount), source: source ?? "", date: String(date) })
    .returning();

  res.status(201).json(CreateIncomeResponse.parse({
    id: row.id,
    amount: Number(row.amount),
    source: row.source,
    date: row.date,
  }));
});

router.delete("/income/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteIncomeParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const result = await db
    .delete(incomeTable)
    .where(eq(incomeTable.id, parsed.data.id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).send();
});

export default router;
