import { Router } from "express";
import { verifyAuthentication } from "@/middlewares/verifyAuthentication";
import { GoalController } from "@/controllers/GoalController";

// register all goal routes
export default (router: Router, baseApiUrl: string = "/") => {
    const goalRouter = Router();
    goalRouter.get("/active", verifyAuthentication, GoalController.getActiveGoals);
    goalRouter.post("/create", verifyAuthentication, GoalController.createGoalHandler);
    goalRouter.get("/tomorrow", verifyAuthentication, GoalController.getTomorrowGoals);
    goalRouter.get("/next-7-days", verifyAuthentication, GoalController.getNext7DayGoals);

    goalRouter.delete("/:id", verifyAuthentication, GoalController.deleteGoalHandler);
    goalRouter.put("/:id", verifyAuthentication, GoalController.updateGoalHandler);

    router.use(baseApiUrl, goalRouter);
    return router;
}