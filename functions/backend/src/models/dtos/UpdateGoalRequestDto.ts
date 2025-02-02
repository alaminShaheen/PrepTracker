import { Goal } from "@/models/Goal";

export type UpdateGoalRequestDto = Partial<Pick<Goal, "name" | "description" | "status" | "endDate" | "startDate" | "progress">>

