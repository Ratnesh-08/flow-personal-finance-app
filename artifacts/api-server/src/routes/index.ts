import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import incomeRouter from "./income.js";
import billsRouter from "./bills.js";
import settingsRouter from "./settings.js";
import dashboardRouter from "./dashboard.js";
import analyticsRouter from "./analytics.js";
import exportRouter from "./exportRoute.js";
import recurringRouter from "./recurring.js";
import savingsGoalsRouter from "./savingsGoals.js";
import demoRouter from "./demo.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(incomeRouter);
router.use(billsRouter);
router.use(settingsRouter);
router.use(dashboardRouter);
router.use(analyticsRouter);
router.use(exportRouter);
router.use(recurringRouter);
router.use(savingsGoalsRouter);
router.use(demoRouter);

export default router;