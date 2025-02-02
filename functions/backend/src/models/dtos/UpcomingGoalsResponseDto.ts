import { Goal } from "@/models/Goal";

export type UpcomingGoalsResponseDto = {
    tomorrow: Goal[];
    nextSevenDays: Goal[];
}