import { NextFunction, Request, Response } from "express";
import { VisualizationService } from "@/services/VisualizationService";
import { CreateHeatmapRequest } from "@/models/dtos/CreateHeatmapRequest";

export async function getHeatmapData(req: Request, res: Response, next: NextFunction) {
    try {
        const heatmapData = await VisualizationService.getHeatmapData(req.userInfo.uid);
        res.status(200).json(heatmapData);
        return;
    } catch (error) {
        next(error);
    }
}

export async function createHeatmapEntry(req: Request<{}, {}, CreateHeatmapRequest>, response: Response, next: NextFunction) {
    try {
        const newHeatmapEntry = await VisualizationService.createHeatmapEntry(req.body, req.userInfo.uid);
        response.status(200).json(newHeatmapEntry);
        return;
    } catch (error) {
        next(error);
    }
}

export async function updateHeatmapEntry(req: Request<{ id: string }, {}, CreateHeatmapRequest>, response: Response, next: NextFunction) {
    try {
        const updatedHeatmapEntry = await VisualizationService.updateHeatmapEntry(req.params.id, req.body, req.userInfo.uid);
        response.status(200).json(updatedHeatmapEntry);
        return;
    } catch (error) {
        next(error);
    }
}


export const VisualizationController = {
    getHeatmapData,
    createHeatmapEntry,
    updateHeatmapEntry
};