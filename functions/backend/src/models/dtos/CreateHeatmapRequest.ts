import { HeatmapEntry } from "@/models/HeatmapEntry";

export type CreateHeatmapRequest = Pick<HeatmapEntry, "dateKey" | "tasksCompleted">