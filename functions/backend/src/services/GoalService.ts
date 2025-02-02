import { Goal } from "@/models/Goal";
import { AppError } from "@/errors/AppError";
import { GoalType } from "@/models/enums/GoalType";
import { GoalStatus } from "@/models/enums/GoalStatus";
import { v4 as uuidv4 } from "uuid";
import { GoalRepository } from "@/repositories/GoalRepository";
import { CreateGoalRequestDto } from "@/models/dtos/CreateGoalRequestDto";
import { UpdateGoalRequestDto } from "@/models/dtos/UpdateGoalRequestDto";
import { addDays, addWeeks, differenceInCalendarDays, format, isAfter, isTomorrow, startOfDay } from "date-fns";
import { UpcomingGoalsResponseDto } from "@/models/dtos/UpcomingGoalsResponseDto";

async function createGoal(goal: CreateGoalRequestDto, userId: string) {
    try {
        const goalProgress: Record<string, boolean> = {};
        const startDate = new Date(goal.startDate), endDate = new Date(goal.endDate);
        if (goal.goalType === GoalType.DAILY) {
            const totalDays = differenceInCalendarDays(endDate, startDate);

            for (let i = 0; i <= totalDays; i++) {
                const currentDate = addDays(new Date(startDate), i);
                const dateString = format(currentDate, "yyyy-MM-dd");
                goalProgress[dateString] = false;
            }
        } else if (goal.goalType === GoalType.WEEKLY) {
            let currentWeek = startOfDay(startDate);

            while (isAfter(currentWeek, endDate)) {
                const weekKey = format(currentWeek, "yyyy-ww");
                goalProgress[weekKey] = false;
                currentWeek = addWeeks(currentWeek, 1);
            }
        } else {
            const dateString = format(startDate, "yyyy-MM-dd");
            goalProgress[dateString] = false;
        }
        const newGoal = new Goal({...goal, id: uuidv4(), progress: goalProgress, updatedAt: new Date(), createdAt: new Date(), userId, status: GoalStatus.ACTIVE})
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
        return await GoalRepository.getActiveGoals(userId);
    } catch (error: any) {
        throw error;
    }
}

async function getUpcomingGoals(userId: string): Promise<UpcomingGoalsResponseDto> {
    try {
        const rawUpcomingGoals = await GoalRepository.getUpcomingGoals(userId);
        return rawUpcomingGoals.reduce((upcomingGoals, currentGoal) => {
            if (isTomorrow(currentGoal.startDate)) {
                upcomingGoals.tomorrow.push(currentGoal);
            } else if (differenceInCalendarDays(currentGoal.startDate, new Date()) <= 7) {
                upcomingGoals.nextSevenDays.push(currentGoal);
            }
            return upcomingGoals;
        }, {nextSevenDays: [], tomorrow: []} as UpcomingGoalsResponseDto)
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
    getUpcomingGoals
};