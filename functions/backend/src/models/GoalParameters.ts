import { GoalType } from "@/models/enums/GoalType";
import { GoalStatus } from "@/models/enums/GoalStatus";

export type GoalParameters = {
    id: string;
    userId: string;
    goalType: GoalType;
    status: GoalStatus;
    progress: Record<string, boolean>;
    name: string;
    description?: string;
}