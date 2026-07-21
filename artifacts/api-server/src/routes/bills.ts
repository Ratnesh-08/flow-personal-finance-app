import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, billsTable } from "@workspace/db";
import {
  CreateBillBody,
  CreateBillResponse,
  DeleteBillParams,
  ListBillsResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/bills", async (req, res): Promise<void> => {
  const rows = await db.select().from(billsTable).orderBy(billsTable.name);
  res.json(ListBillsResponse.parse(rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    name: r.name,
  }))));
});

router.post("/bills", async (req, res): Promise<void> => {
  const parsed = CreateBillBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid bill body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { amount, name } = parsed.data;
  const [row] = await db
    .insert(billsTable)
    .values({ amount: String(amount), name })
    .returning();

  res.status(201).json(CreateBillResponse.parse({
    id: row.id,
    amount: Number(row.amount),
    name: row.name,
  }));
});

router.delete("/bills/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteBillParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const result = await db
    .delete(billsTable)
    .where(eq(billsTable.id, parsed.data.id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).send();
});

export default router;
