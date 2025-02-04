import { Goal } from "@/models/Goal";

export type CreateGoalRequest = Pick<Goal, "name" | "description" | "startDate" | "endDate" | "goalType">