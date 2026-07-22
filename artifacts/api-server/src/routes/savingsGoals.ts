import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, savingsGoalsTable } from "@workspace/db";
import {
  CreateSavingsGoalBody,
  UpdateSavingsGoalBody,
  ListSavingsGoalsResponse,
  CreateSavingsGoalResponse,
  UpdateSavingsGoalResponse,
  DeleteSavingsGoalParams,
} from "@workspace/api-zod";

const router = Router();

const toRecord = (r: typeof savingsGoalsTable.$inferSelect) => ({
  id: r.id,
  name: r.name,
  targetAmount: Number(r.targetAmount),
  currentAmount: Number(r.currentAmount),
  deadline: r.deadline ?? null,
  completed: r.completed,
  createdAt: r.createdAt.toISOString(),
});

router.get("/savings-goals", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(savingsGoalsTable)
    .orderBy(savingsGoalsTable.createdAt);

  res.json(ListSavingsGoalsResponse.parse(rows.map(toRecord)));
});

router.post("/savings-goals", async (req, res): Promise<void> => {
  const parsed = CreateSavingsGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, targetAmount, currentAmount, deadline, completed } = parsed.data;
  const [row] = await db
    .insert(savingsGoalsTable)
    .values({
      name,
      targetAmount: String(targetAmount),
      currentAmount: String(currentAmount ?? 0),
      deadline: deadline ? String(deadline) : null,
      completed: completed ?? false,
    })
    .returning();

  res.status(201).json(CreateSavingsGoalResponse.parse(toRecord(row)));
});

router.put("/savings-goals/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = UpdateSavingsGoalBody.safeParse(req.body);
  if (!parsed.success || isNaN(id)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const updates: Partial<typeof savingsGoalsTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.targetAmount !== undefined) updates.targetAmount = String(parsed.data.targetAmount);
  if (parsed.data.currentAmount !== undefined) updates.currentAmount = String(parsed.data.currentAmount);
  if (parsed.data.deadline !== undefined) updates.deadline = parsed.data.deadline ? String(parsed.data.deadline) : null;
  if (parsed.data.completed !== undefined) updates.completed = parsed.data.completed;

  const [row] = await db
    .update(savingsGoalsTable)
    .set(updates)
    .where(eq(savingsGoalsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(UpdateSavingsGoalResponse.parse(toRecord(row)));
});

router.delete("/savings-goals/:id", async (req, res): Promise<void> => {
  const parsed = DeleteSavingsGoalParams.safeParse({ id: parseInt(req.params.id, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const result = await db
    .delete(savingsGoalsTable)
    .where(eq(savingsGoalsTable.id, parsed.data.id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).send();
});

export default router;
