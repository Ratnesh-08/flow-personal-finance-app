import { Router, type IRouter } from "express";
import healthRouter from "./health";
import incomeRouter from "./income";
import billsRouter from "./bills";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";
import analyticsRouter from "./analytics";
import exportRouter from "./exportRoute";
import recurringRouter from "./recurring";
import savingsGoalsRouter from "./savingsGoals";
import demoRouter from "./demo";

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
