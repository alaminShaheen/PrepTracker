import { VisualizationRepository } from "@/repositories/VisualizationRepository";
import { HeatmapEntry } from "@/models/HeatmapEntry";
import { CreateHeatmapRequest } from "@/models/dtos/CreateHeatmapRequest";
import { AppError } from "@/errors/AppError";
import { Goal } from "@/models/Goal";
import { v4 as uuidv4 } from "uuid";

async function getHeatmapData(userId: string) {
    try {
        return await VisualizationRepository.getAllUserVisualizations(userId);
    } catch (error) {
        throw error;
    }
}

async function createHeatmapEntry(heatmap: CreateHeatmapRequest, userId: string) {
    try {
        const newHeatmapEntry = new HeatmapEntry({ ...heatmap, userId });
        return await VisualizationRepository.updateVisualization(newHeatmapEntry);
    } catch (error) {
        throw error;
    }
}

async function updateHeatmapEntry(heatmapId: string, heatmap: CreateHeatmapRequest, userId: string) {
    try {
        const heatmapEntrySnapshot = await VisualizationRepository.getVisualizationWithIdSnapshot(heatmapId);
        if (heatmapEntrySnapshot.empty) throw new AppError(400, "Heatmap entry not found");
        return await VisualizationRepository.updateVisualization(heatmapEntrySnapshot.docs[0].data());
    } catch (error) {
        throw error;
    }
}

async function updateHeatmapEntries(prevGoal: Goal, updatedGoal: Goal, userId: string) {
    try {
        const prevGoalProgress = Object.entries(prevGoal.progress);
        const prevGoalProgressMap = prevGoalProgress.reduce((prevGoalMap, [prevDateKey, prevValue]) => {
            prevGoalMap.set(prevDateKey, prevValue);
            return prevGoalMap;
        }, new Map());
        const updatedGoalProgress = Object.entries(updatedGoal.progress);

        if (prevGoalProgress.length === updatedGoalProgress.length) {
            for (const [updatedDateKey, updatedValue] of updatedGoalProgress) {
                if (prevGoalProgressMap.has(updatedDateKey) && prevGoalProgressMap.get(updatedDateKey) === updatedValue) continue;
                const visualizationSnapshot = await VisualizationRepository.getVisualizationSnapshot(updatedDateKey, userId);

                if (!updatedValue) {
                    // user unchecked
                    if (!visualizationSnapshot.empty) {
                        // user unchecked a task that previously had a heatmap entry
                        const data = visualizationSnapshot.docs[0].data();
                        await VisualizationRepository.updateVisualization({...data, tasksCompleted: Math.max(data.tasksCompleted - 1, 0)})
                    }
                } else {
                    // user checked
                    if (visualizationSnapshot.empty) {
                        // no previous heatmap entry for this dateKey was created
                        await VisualizationRepository.createVisualization(new HeatmapEntry({
                            id: uuidv4().toString(),
                            userId,
                            dateKey: updatedDateKey,
                            tasksCompleted: 1
                        }));
                    } else {
                        // increment previous heatmap entry for this already created heatmap entry with dateKey
                        const data = visualizationSnapshot.docs[0].data();
                        await VisualizationRepository.updateVisualization({...data, tasksCompleted: data.tasksCompleted + 1})
                    }
                }
            }
        }
        return;
    } catch (error) {
        throw error;
    }

}

export const VisualizationService = {
    getHeatmapData,
    createHeatmapEntry,
    updateHeatmapEntry,
    updateHeatmapEntries,
};