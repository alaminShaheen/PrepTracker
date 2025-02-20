import { GoalType } from "@/models/enums/GoalType";
import { GoalStatus } from "@/models/enums/GoalStatus";

export type Goal = {
    id: string;
    userId: string;
    name: string;
    description?: string;
    goalType: GoalType;
    startDate: string;
    endDate: string;
    status: GoalStatus;
    progress: Record<string, boolean>;
    createdAt: string;
    updatedAt: string;
}