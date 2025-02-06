import { Goal } from "@/models/Goal";
import { AppError } from "@/errors/AppError";
import { GoalType } from "@/models/enums/GoalType";
import { GoalStatus } from "@/models/enums/GoalStatus";
import { v4 as uuidv4 } from "uuid";
import { GoalRepository } from "@/repositories/GoalRepository";
import { CreateGoalRequestDto } from "@/models/dtos/CreateGoalRequestDto";
import { UpdateGoalRequestDto } from "@/models/dtos/UpdateGoalRequestDto";
import { addDays, differenceInCalendarDays, format, isAfter, isBefore, isSameDay, min, parse } from "date-fns";
import { APP_CONSTANTS } from "@/constants/appConstants";
import { doRangesOverlap, isDateInBetweenRange } from "@/utils/dateUtils";

async function createGoal(goal: CreateGoalRequestDto, userId: string) {
    try {
        const goalProgress: Record<string, boolean> = {};
        const startDate = new Date(goal.startDate), endDate = new Date(goal.endDate);
        if (goal.goalType === GoalType.DAILY) {
            const totalDays = differenceInCalendarDays(endDate, startDate);

            for (let i = 0; i <= totalDays; i++) {
                const currentDate = addDays(new Date(startDate), i);
                const dateString = format(currentDate, APP_CONSTANTS.DATE_FORMAT);
                goalProgress[dateString] = false;
            }
        } else if (goal.goalType === GoalType.WEEKLY) {
            let currentWeekStart = startDate;
            while (isAfter(endDate, currentWeekStart)) {
                const currentWeekEnd = min([addDays(currentWeekStart, 6), endDate]);
                const weekKey = `${format(currentWeekStart, APP_CONSTANTS.DATE_FORMAT)} ${format(currentWeekEnd, APP_CONSTANTS.DATE_FORMAT)}`;
                goalProgress[weekKey] = false;
                currentWeekStart = addDays(currentWeekStart, 7);
            }
        } else {
            const dateString = format(startDate, APP_CONSTANTS.DATE_FORMAT);
            goalProgress[dateString] = false;
        }
        const newGoal = new Goal({
            ...goal,
            id: uuidv4(),
            progress: goalProgress,
            updatedAt: new Date(),
            createdAt: new Date(),
            userId,
            status: GoalStatus.ACTIVE
        });
        return await GoalRepository.createGoal(newGoal);
    } catch (error) {
        throw error;
    }
}

async function updateGoal(goalInfo: UpdateGoalRequestDto, goalId: string, userId: string): Promise<Goal> {
    try {
        const goal = await GoalRepository.getGoal(goalId);

        if (!goal) {
            throw new AppError(404, "Goal not Found");
        } else if (goal.userId !== userId) {
            throw new AppError(403, "Forbidden request");
        }

        const updatedGoal = await GoalRepository.updateGoal(goalId, goalInfo);

        if (!updatedGoal) {
            throw new AppError(500, "Goal could not be updated");
        }

        return updatedGoal;

    } catch (error) {
        throw error;
    }
}

async function deleteGoal(goalId: string, userId: string): Promise<boolean> {
    try {
        const goal = await GoalRepository.getGoal(goalId);

        if (!goal) {
            throw new AppError(404, "Goal not Found");
        } else if (goal.userId !== userId) {
            throw new AppError(403, "Forbidden request");
        }

        const success = await GoalRepository.deleteGoal(goalId);

        if (!success) {
            throw new AppError(500, "Goal could not be deleted");
        }

        return success;
    } catch (error: any) {
        throw error;
    }
}

async function getGoal(goalId: string, userId: string) {
    try {
        const goal = await GoalRepository.getGoal(goalId);

        if (!goal) {
            throw new AppError(404, "Goal not Found");
        } else if (goal.userId !== userId) {
            throw new AppError(403, "Forbidden request");
        }

        return goal;

    } catch (error: any) {
        throw error;
    }
}

async function getActiveGoals(userId: string): Promise<Goal[]> {
    try {
        const activeGoals = await GoalRepository.getActiveGoals(userId);
        return activeGoals.filter(activeGoal => {
            if (activeGoal.goalType === GoalType.DAILY || activeGoal.goalType === GoalType.ONE_TIME) {
                return Object.keys(activeGoal.progress).find(dateKey => dateKey === format(new Date(), APP_CONSTANTS.DATE_FORMAT));
            } else {
                return Object.keys(activeGoal.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(weekStartDate, weekEndDate, new Date());
                });
            }
        })
    } catch (error: any) {
        throw error;
    }
}

async function getTomorrowGoals(userId: string): Promise<Goal[]> {
    try {
        const activeGoals = await GoalRepository.getActiveGoals(userId);
        const tomorrowDate = addDays(new Date(), 1);
        return activeGoals.filter(activeGoal => {
            if (activeGoal.goalType === GoalType.DAILY || activeGoal.goalType === GoalType.ONE_TIME) {
                return Object.keys(activeGoal.progress).find(dateKey => dateKey === format(tomorrowDate, APP_CONSTANTS.DATE_FORMAT));
            } else {
                return Object.keys(activeGoal.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(weekStartDate, weekEndDate, tomorrowDate);
                });
            }
        });
    } catch (error: any) {
        throw error;
    }
}

async function next7DayGoals(userId: string): Promise<Goal[]> {
    try {
        const activeGoals = await GoalRepository.getActiveGoals(userId);
        const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));
        const next7StartDate = addDays(new Date(), 1);
        const next7EndDate = addDays(next7StartDate, 6);

        return activeGoals.filter(activeGoal => {
            if (activeGoal.goalType === GoalType.DAILY || activeGoal.goalType === GoalType.ONE_TIME) {
                return Object.keys(activeGoal.progress).find(dateKey => {
                    const date = parse(dateKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    console.log(dateKey, format(next7StartDate, APP_CONSTANTS.DATE_FORMAT), format(next7EndDate, APP_CONSTANTS.DATE_FORMAT), isDateInBetweenRange(next7StartDate, next7EndDate, date));
                    return isDateInBetweenRange(next7StartDate, next7EndDate, date);
                });
            } else {
                return Object.keys(activeGoal.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return next7Days.find(day => isDateInBetweenRange(weekStartDate, weekEndDate, day))
                });
            }
        });
    } catch (error: any) {
        throw error;
    }
}

export const GoalService = {
    createGoal,
    getGoal,
    deleteGoal,
    updateGoal,
    getActiveGoals,
    getTomorrowGoals,
    next7DayGoals,
};