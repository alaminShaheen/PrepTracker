import { v4 as uuidv4 } from "uuid";

type HeatmapEntryWithParams = {
    id?: string;
    userId: string;
    tasksCompleted?: number;
    dateKey: string;
}

export class HeatmapEntry {
    public id: string;
    public userId: string;
    public tasksCompleted: number;
    public dateKey: string;

    constructor(params: HeatmapEntryWithParams) {
        this.id = params.id || uuidv4().toString();
        this.tasksCompleted = params.tasksCompleted || 0;
        this.userId = params.userId;
        this.dateKey = params.dateKey;
    }
}