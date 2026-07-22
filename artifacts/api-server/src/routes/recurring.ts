import { Router } from "express";
import { eq, type SQL } from "drizzle-orm";
import { db, recurringItemsTable } from "@workspace/db";
import {
  ListRecurringQueryParams,
  CreateRecurringBody,
  UpdateRecurringBody,
  DeleteRecurringParams,
  ListRecurringResponse,
  CreateRecurringResponse,
  UpdateRecurringResponse,
} from "@workspace/api-zod";

const router = Router();

const toRecord = (r: typeof recurringItemsTable.$inferSelect) => ({
  id: r.id,
  type: r.type as "income" | "bill",
  name: r.name,
  amount: Number(r.amount),
  category: r.category,
  frequency: r.frequency as "daily" | "weekly" | "monthly" | "yearly",
  startDate: r.startDate,
  active: r.active,
});

router.get("/recurring", async (req, res): Promise<void> => {
  const parsed = ListRecurringQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (parsed.data.type) {
    conditions.push(eq(recurringItemsTable.type, parsed.data.type));
  }

  const rows = await db
    .select()
    .from(recurringItemsTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(recurringItemsTable.name);

  res.json(ListRecurringResponse.parse(rows.map(toRecord)));
});

router.post("/recurring", async (req, res): Promise<void> => {
  const parsed = CreateRecurringBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, name, amount, category, frequency, startDate, active } = parsed.data;
  const [row] = await db
    .insert(recurringItemsTable)
    .values({
      type,
      name,
      amount: String(amount),
      category: category ?? "other",
      frequency,
      startDate: String(startDate),
      active: active ?? true,
    })
    .returning();

  res.status(201).json(CreateRecurringResponse.parse(toRecord(row)));
});

router.put("/recurring/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = UpdateRecurringBody.safeParse(req.body);
  if (!parsed.success || isNaN(id)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { type, name, amount, category, frequency, startDate, active } = parsed.data;
  const [row] = await db
    .update(recurringItemsTable)
    .set({
      type,
      name,
      amount: String(amount),
      category: category ?? "other",
      frequency,
      startDate: String(startDate),
      active: active ?? true,
    })
    .where(eq(recurringItemsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(UpdateRecurringResponse.parse(toRecord(row)));
});

router.delete("/recurring/:id", async (req, res): Promise<void> => {
  const parsed = DeleteRecurringParams.safeParse({ id: parseInt(req.params.id, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const result = await db
    .delete(recurringItemsTable)
    .where(eq(recurringItemsTable.id, parsed.data.id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).send();
});

export default router;
