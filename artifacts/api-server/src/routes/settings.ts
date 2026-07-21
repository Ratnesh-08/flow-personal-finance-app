import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { GetSettingsResponse, UpdateSettingsBody, UpdateSettingsResponse } from "@workspace/api-zod";

const router = Router();

async function ensureSettings() {
  const rows = await db.select().from(settingsTable);
  if (rows.length === 0) {
    const [row] = await db.insert(settingsTable).values({}).returning();
    return row;
  }
  return rows[0];
}

router.get("/settings", async (req, res): Promise<void> => {
  const s = await ensureSettings();
  res.json(GetSettingsResponse.parse({
    bufferPct: Number(s.bufferPct),
    bufferBalance: Number(s.bufferBalance),
    bufferGoalMonths: Number(s.bufferGoalMonths),
    onboarded: s.onboarded,
  }));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid settings body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const s = await ensureSettings();
  const updates: Record<string, unknown> = {};
  if (parsed.data.bufferPct !== undefined) updates.bufferPct = String(parsed.data.bufferPct);
  if (parsed.data.bufferBalance !== undefined) updates.bufferBalance = String(parsed.data.bufferBalance);
  if (parsed.data.bufferGoalMonths !== undefined) updates.bufferGoalMonths = String(parsed.data.bufferGoalMonths);
  if (parsed.data.onboarded !== undefined) updates.onboarded = parsed.data.onboarded;

  const { eq } = await import("drizzle-orm");
  const [updated] = await db
    .update(settingsTable)
    .set(updates)
    .where(eq(settingsTable.id, s.id))
    .returning();

  res.json(UpdateSettingsResponse.parse({
    bufferPct: Number(updated.bufferPct),
    bufferBalance: Number(updated.bufferBalance),
    bufferGoalMonths: Number(updated.bufferGoalMonths),
    onboarded: updated.onboarded,
  }));
});

export default router;
