import { Router } from "express";
import { VisualizationController } from "@/controllers/VisualizationController";
import { verifyAuthentication } from "@/middlewares/verifyAuthentication";

// register all auth routes
export default (router: Router, baseApiUrl: string = "/") => {
    const visualizationRouter = Router();

    visualizationRouter.get("/", verifyAuthentication, VisualizationController.getHeatmapData);
    visualizationRouter.post("/create", verifyAuthentication, VisualizationController.createHeatmapEntry);
    visualizationRouter.put("/update/:id", verifyAuthentication, VisualizationController.updateHeatmapEntry);

    router.use(baseApiUrl, visualizationRouter);
    return router;
}