import { Router } from "express";
import AuthRouter from "@/routers/AuthRouter";
import HealthCheckRouter from "@/routers/HealthCheckRouter";
import GoalRouter from "@/routers/GoalRouter";

const router = Router();

export default () => {
    AuthRouter(router, "/auth");
    HealthCheckRouter(router, "/healthcheck");
    GoalRouter(router, "/goal");
    return router;
};