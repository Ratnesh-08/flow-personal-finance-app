import { Router } from "express";
import { eq, ilike, and, gte, lte, type SQL } from "drizzle-orm";
import { db, incomeTable } from "@workspace/db";
import {
  ListIncomeQueryParams,
  CreateIncomeBody,
  CreateIncomeResponse,
  DeleteIncomeParams,
  ListIncomeResponse,
  UpdateIncomeBody,
  UpdateIncomeResponse,
} from "@workspace/api-zod";

const router = Router();

const toRecord = (r: typeof incomeTable.$inferSelect) => ({
  id: r.id,
  amount: Number(r.amount),
  source: r.source,
  date: r.date,
  category: r.category,
});

router.get("/income", async (req, res): Promise<void> => {
  const parsed = ListIncomeQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { search, category, dateFrom, dateTo, amountMin, amountMax } = parsed.data;

  const conditions: SQL[] = [];
  if (search) conditions.push(ilike(incomeTable.source, `%${search}%`));
  if (category) conditions.push(eq(incomeTable.category, category));
  if (dateFrom) conditions.push(gte(incomeTable.date, String(dateFrom)));
  if (dateTo) conditions.push(lte(incomeTable.date, String(dateTo)));
  if (amountMin !== undefined) conditions.push(gte(incomeTable.amount, String(amountMin)));
  if (amountMax !== undefined) conditions.push(lte(incomeTable.amount, String(amountMax)));

  const rows = await db
    .select().from(incomeTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(incomeTable.date);

  res.json(ListIncomeResponse.parse(rows.map(toRecord)));
});

router.post("/income", async (req, res): Promise<void> => {
  const parsed = CreateIncomeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { amount, source, date, category } = parsed.data;
  const [row] = await db.insert(incomeTable).values({
    amount: String(amount), source: source ?? "", date: String(date), category: category ?? "other",
  }).returning();

  res.status(201).json(CreateIncomeResponse.parse(toRecord(row)));
});

router.patch("/income/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = UpdateIncomeBody.safeParse(req.body);
  if (!parsed.success || isNaN(id)) { res.status(400).json({ error: "Invalid input" }); return; }

  const { amount, source, date, category } = parsed.data;
  const [row] = await db.update(incomeTable).set({
    amount: String(amount), source: source ?? "", date: String(date), category: category ?? "other",
  }).where(eq(incomeTable.id, id)).returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateIncomeResponse.parse(toRecord(row)));
});

router.delete("/income/:id", async (req, res): Promise<void> => {
  const parsed = DeleteIncomeParams.safeParse({ id: parseInt(req.params.id, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const result = await db.delete(incomeTable).where(eq(incomeTable.id, parsed.data.id)).returning();
  if (result.length === 0) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

export default router;
