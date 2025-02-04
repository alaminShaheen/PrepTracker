import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GoalType } from "@/models/enums/GoalType";
import { addDays, Day, format, getDay, isAfter, isBefore, startOfWeek } from "date-fns";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { Goal } from "@/models/Goal";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toastDateFormat(date: Date) {
    return `${new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit"
    }).format(date)} at ${new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(date)}`;
}

export function getGoalDateKey(goal: Goal) {
    if (goal.goalType === GoalType.DAILY || goal.goalType === GoalType.ONE_TIME) {
        return format(new Date(), APP_CONSTANTS.DATE_FORMAT);
    } else {
        const goalStartDateKey = startOfWeek(goal.startDate, { weekStartsOn: getDay(goal.startDate) as Day });
        const goalEndDateKey = addDays(goal.startDate, 6);
        return `${goalStartDateKey} ${goalEndDateKey}`;
    }
}

export function isDateInBetweenRange(startDate: Date, endDate: Date, referenceDate: Date) {
    return isAfter(referenceDate, startDate) && isBefore(referenceDate, endDate);
}