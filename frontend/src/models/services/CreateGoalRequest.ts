import { Goal } from "@/models/Goal";

export type CreateGoalRequest = Pick<Goal, "name" | "description" | "goalType"> & {
    startDate: string;
    endDate: string;
}