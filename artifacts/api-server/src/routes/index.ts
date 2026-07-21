import { Router, type IRouter } from "express";
import healthRouter from "./health";
import incomeRouter from "./income";
import billsRouter from "./bills";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(incomeRouter);
router.use(billsRouter);
router.use(settingsRouter);
router.use(dashboardRouter);

export default router;
