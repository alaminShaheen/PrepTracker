import { Goal } from "@/models/Goal";

export type CreateGoalRequestDto = Pick<Goal, "name" | "description" | "startDate" | "endDate" | "goalType">