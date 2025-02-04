import { z } from "zod";
import { GoalType } from "@/models/enums/GoalType";
import { compareAsc } from "date-fns";

// export type CreateGoalForm = Pick<Goal, "goalType" | "startDate" | "name" | "description" | "endDate" | "userId">

export const GoalSchema = z.object({
    goalType: z.enum([GoalType.DAILY, GoalType.ONE_TIME, GoalType.WEEKLY]),
    startDate: z.date(),
    name: z.string().min(1, "Goal name is required"),
    description: z.string().optional(),
    endDate: z.date()
}).refine((data) => compareAsc(data.endDate, data.startDate) === 0 || compareAsc(data.endDate, data.startDate) === 1, {
    message: "End date must be greater than start date",
    path: ["endDate"]
});

export type GoalForm = z.infer<typeof GoalSchema>;