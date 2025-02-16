import { Goal } from "@/models/Goal";
import { AppError } from "@/errors/AppError";
import { GoalType } from "@/models/enums/GoalType";
import { GoalStatus } from "@/models/enums/GoalStatus";
import { v4 as uuidv4 } from "uuid";
import { GoalRepository } from "@/repositories/GoalRepository";
import { CreateGoalRequestDto } from "@/models/dtos/CreateGoalRequestDto";
import { UpdateGoalRequestDto } from "@/models/dtos/UpdateGoalRequestDto";
import { addDays, differenceInCalendarDays, format, isAfter, min, parse } from "date-fns";
import { APP_CONSTANTS } from "@/constants/appConstants";
import { isDateInBetweenRange } from "@/utils/dateUtils";
import { User } from "@/models/User";
import { Timestamp } from "firebase-admin/firestore";
import { getDatabaseInstance } from "../database";
import { CLIENT_ORIGIN, OPENROUTER_API_KEY, SERVER_URL } from "@/configs/config";
import axios from "axios";
import { VisualizationService } from "@/services/VisualizationService";

async function createGoal(goal: CreateGoalRequestDto, userId: string) {
    try {
        const goalProgress: Record<string, boolean> = {};
        const startDate = new Date(goal.startDate), endDate = new Date(goal.endDate);
        if (goal.goalType === GoalType.DAILY) {
            // including the start date
            const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

            console.log(startDate, new Date(startDate), addDays(new Date(startDate), 0));
            for (let i = 0; i < totalDays; i++) {
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

        await VisualizationService.updateHeatmapEntries(goal, updatedGoal, userId);

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
        });
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
                    return next7Days.find(day => isDateInBetweenRange(weekStartDate, weekEndDate, day));
                });
            }
        });
    } catch (error: any) {
        throw error;
    }
}

async function cleanExpiredGoals(userId: string): Promise<void> {
    try {
        const batch = getDatabaseInstance().batch();
        const goalsTable = GoalRepository.getGoalTable();
        const goalsSnapshot = await goalsTable
            .where("userId", "==", userId)
            .where("endDate", "<", Timestamp.fromDate(new Date()))
            .get();

        if (!goalsSnapshot.empty) {
            goalsSnapshot.forEach((goalDoc) => {
                batch.delete(goalDoc.ref);
            });
        }
        await batch.commit();
    } catch (error) {
        throw error;
    }
}

async function getUserEmailGoals(userData: User) {
    try {
        const goalsTable = GoalRepository.getGoalTable();
        const activeTodayGoals: Goal[] = [];
        const activeOneTimeGoals: Goal[] = [];
        const activeWeeklyGoals: Goal[] = [];

        const quoteOfTheDay = "Some motivational quote";

        let todayDailyGoalsSnapshot = await goalsTable
            .where("userId", "==", userData.id)
            .where("status", "==", GoalStatus.ACTIVE)
            .where("goalType", "==", GoalType.DAILY)
            .get();

        const todayOneTimeGoals = await goalsTable
            .where("userId", "==", userData.id)
            .where("status", "==", GoalStatus.ACTIVE)
            .where("goalType", "==", GoalType.ONE_TIME)
            .get();

        if (!todayDailyGoalsSnapshot.empty) {
            todayDailyGoalsSnapshot.forEach((goalDoc) => {
                const data = GoalRepository.normalizeDates(goalDoc.data());
                if (isDateInBetweenRange(data.startDate!, data.endDate!, new Date())) {
                    activeTodayGoals.push(data as Goal);
                }
            });
        }

        if (!todayOneTimeGoals.empty) {
            todayOneTimeGoals.forEach((goalDoc) => {
                const data = GoalRepository.normalizeDates(goalDoc.data());
                if (isDateInBetweenRange(data.startDate!, data.endDate!, new Date())) {
                    activeOneTimeGoals.push(data as Goal);
                }
            });
        }

        const todayWeeklyGoalsSnapshot = await goalsTable
            .where("userId", "==", userData.id)
            .where("status", "==", GoalStatus.ACTIVE)
            .where("goalType", "==", GoalType.WEEKLY)
            .get();

        if (!todayWeeklyGoalsSnapshot.empty) {
            todayWeeklyGoalsSnapshot.forEach((goalDoc) => {
                const data = goalDoc.data();
                const found = Object.entries(data.progress).find(([key, value]) => {
                    const [startDateKey, endDateKey] = key.split(" ").map(dateKey => parse(dateKey, APP_CONSTANTS.DATE_FORMAT, new Date()));
                    if (isDateInBetweenRange(startDateKey, endDateKey, new Date()) && value) {
                        activeWeeklyGoals.push(data);
                        return true;
                    }
                });
                if (found) activeWeeklyGoals.push(data);
            });
        }
        return { activeWeeklyGoals, activeTodayGoals, activeOneTimeGoals };
    } catch (e) {
        throw e;
    }

}

async function createEmailTemplate(user: User, dailyGoals: Goal[], weeklyGoals: Goal[], oneTimeGoals: Goal[]) {
    const motivationalQuote = await getAiMotivationalQuote();
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            h2 { color: #333; }
            .goal-section { margin-bottom: 20px; }
            .goal { padding: 10px; border-bottom: 1px solid #eee; }
            .goal:last-child { border-bottom: none; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hello ${user.firstname},</h2>
           <div style="margin: 8px 0;">   
                <h2 style="color: #2c3e50;">📢 Daily Motivation</h2>
                <p style="font-style: italic; font-size: 18px; color: #16a085;">"${motivationalQuote}"</p>
            </div>
            
            
            <p>Here are your pending tasks for today:</p>
            ${dailyGoals.length > 0 ? `
            <div class="goal-section">
                <h3>📅 Daily Tasks</h3>
                ${dailyGoals.map(goal => `
                    <div class="goal">
                        <strong>${goal.name}</strong>
                        <p>${goal.description || "No description provided."}</p>
                    </div>
                `).join("")}
            </div>
            ` : ""}

            ${weeklyGoals.length > 0 ? `
            <div class="goal-section">
                <h3>📆 Weekly Tasks</h3>
                ${weeklyGoals.map(goal => `
                    <div class="goal">
                        <strong>${goal.name}</strong>
                        <p>${goal.description || "No description provided."}</p>
                    </div>
                `).join("")}
            </div>
            ` : ""}

            ${oneTimeGoals.length > 0 ? `
            <div class="goal-section">
                <h3>✅ One-Time Tasks</h3>
                ${oneTimeGoals.map(goal => `
                    <div class="goal">
                        <strong>${goal.name}</strong>
                        <p>${goal.description || "No description provided."}</p>
                    </div>
                `).join("")}
            </div>
            ` : ""}

            <p>Stay productive! 🚀</p>
            <div class="footer">
                <p><a href="${SERVER_URL}/api/auth/unsubscribe?email=${encodeURIComponent(user.email)}">Unsubscribe</a> | <a href="${CLIENT_ORIGIN}/dashboard">Visit Dashboard</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
}

async function getAiMotivationalQuote(): Promise<string> {
    const prompt = `You are an AI coach helping a students stay motivated. Generate a short, uplifting message to keep them motivated. Just give it to me in text format. Don't return anything else.`;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "meta-llama/llama-3.2-11b-vision-instruct:free",
                messages: [{ role: "system", content: "You are a motivational AI coach." }, {
                    role: "user",
                    content: prompt
                }],
                max_tokens: 100
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error: any) {
        console.error("Error generating message:", error.response ? error.response.data : error.message);
        return "Keep pushing forward! You are making great progress. 🚀";
    }
}

export const GoalService = {
    getAiMotivationalQuote,
    createGoal,
    getGoal,
    deleteGoal,
    updateGoal,
    getActiveGoals,
    getTomorrowGoals,
    next7DayGoals,
    getUserEmailGoals,
    createEmailTemplate,
    cleanExpiredGoals
};