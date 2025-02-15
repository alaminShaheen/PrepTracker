import { Router } from "express";
import { HealthCheckController } from "@/controllers/HealthCheckController";
import { VisualizationController } from "@/controllers/VisualizationController";

// register all auth routes
export default (router: Router, baseApiUrl: string = "/") => {
    const visualizationRouter = Router();

    visualizationRouter.get("/", VisualizationController.getHeatmapData);
    visualizationRouter.post("/create", VisualizationController.createHeatmapEntry);
    visualizationRouter.put("/update/:id", VisualizationController.updateHeatmapEntry);

    router.use(baseApiUrl, visualizationRouter);
    return router;
}