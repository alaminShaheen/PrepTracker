import { z } from "zod";
import { GoalType } from "@/models/enums/GoalType";
import { compareAsc } from "date-fns";

// export type CreateGoalForm = Pick<Goal, "goalType" | "startDate" | "name" | "description" | "endDate" | "userId">

export const GoalSchema = z.object({
    goalType: z.enum([GoalType.DAILY, GoalType.ONE_TIME, GoalType.WEEKLY]),
    startDate: z.string(),
    name: z.string().min(1, "Goal name is required"),
    description: z.string().optional(),
    endDate: z.string()
}).refine((data) => {
    return compareAsc(new Date(data.endDate), new Date(data.startDate)) === 0 || compareAsc(new Date(data.endDate), new Date(data.startDate)) === 1;
}, {
    message: "End date must be greater than start date",
    path: ["endDate"]
});

export type GoalForm = z.infer<typeof GoalSchema>;