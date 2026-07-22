import { Router } from "express";
import { eq, ilike, and, gte, lte, type SQL } from "drizzle-orm";
import { db, billsTable } from "@workspace/db";
import {
  ListBillsQueryParams,
  CreateBillBody,
  CreateBillResponse,
  DeleteBillParams,
  ListBillsResponse,
  UpdateBillBody,
  UpdateBillResponse,
} from "@workspace/api-zod";

const router = Router();

const toRecord = (r: typeof billsTable.$inferSelect) => ({
  id: r.id,
  amount: Number(r.amount),
  name: r.name,
  category: r.category,
});

router.get("/bills", async (req, res): Promise<void> => {
  const parsed = ListBillsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { search, category, amountMin, amountMax } = parsed.data;

  const conditions: SQL[] = [];
  if (search) conditions.push(ilike(billsTable.name, `%${search}%`));
  if (category) conditions.push(eq(billsTable.category, category));
  if (amountMin !== undefined) conditions.push(gte(billsTable.amount, String(amountMin)));
  if (amountMax !== undefined) conditions.push(lte(billsTable.amount, String(amountMax)));

  const rows = await db
    .select().from(billsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(billsTable.name);

  res.json(ListBillsResponse.parse(rows.map(toRecord)));
});

router.post("/bills", async (req, res): Promise<void> => {
  const parsed = CreateBillBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { amount, name, category } = parsed.data;
  const [row] = await db.insert(billsTable).values({
    amount: String(amount), name, category: category ?? "miscellaneous",
  }).returning();

  res.status(201).json(CreateBillResponse.parse(toRecord(row)));
});

router.patch("/bills/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = UpdateBillBody.safeParse(req.body);
  if (!parsed.success || isNaN(id)) { res.status(400).json({ error: "Invalid input" }); return; }

  const { amount, name, category } = parsed.data;
  const [row] = await db.update(billsTable).set({
    amount: String(amount), name: name ?? "", category: category ?? "miscellaneous",
  }).where(eq(billsTable.id, id)).returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateBillResponse.parse(toRecord(row)));
});

router.delete("/bills/:id", async (req, res): Promise<void> => {
  const parsed = DeleteBillParams.safeParse({ id: parseInt(req.params.id, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const result = await db.delete(billsTable).where(eq(billsTable.id, parsed.data.id)).returning();
  if (result.length === 0) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

export default router;
