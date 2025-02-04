import { getDatabaseInstance } from "../database";
import { CollectionReference, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { DATABASE_CONSTANTS } from "@/constants/databaseConstants";
import { Goal } from "@/models/Goal";
import { FirebaseGoal } from "@/models/Firebase/FirebaseGoal";
import { GoalStatus } from "@/models/enums/GoalStatus";

const firestoreGoalConverter = {
    toFirestore: function(goal: Goal) {
        return Object.assign({}, goal);
    },
    fromFirestore: function(snapshot: QueryDocumentSnapshot) {
        const data = snapshot.data() as FirebaseGoal;
        return new Goal({
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate()
        });
    }
};

function getGoalTable() {
    try {
        const databaseInstance = getDatabaseInstance();
        return databaseInstance.collection(DATABASE_CONSTANTS.GOALS_TABLE).withConverter(firestoreGoalConverter) as CollectionReference<Goal, FirebaseGoal>;
    } catch (error) {
        throw error;
    }
}

async function getGoalSnapshot(goalId: string, userId?: string) {
    try {
        const goalsTable = getGoalTable();
        const goalQuery = goalsTable.where("id", "==", goalId);
        if (userId) {
            goalQuery.where("userId", "==", userId);
        }

        const goalSnapshot = await goalQuery.get();

        if (goalSnapshot.empty) {
            return null;
        }

        return goalSnapshot.docs[0];
    } catch (error) {
        throw error;
    }
}

async function getAllGoals(userId: string): Promise<Goal[]> {
    try {
        const goalsTable = getGoalTable();
        const goalsSnapshot = await goalsTable.where("userId", "==", userId).get();
        if (!goalsSnapshot.empty) {
            let goals: Goal[] = [];
            goalsSnapshot.forEach((goalData) => {
                goals.push(goalData.data());
            });

            return goals;
        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}

async function getGoal(goalId: string): Promise<Goal | null> {
    try {
        const goalSnapshot = await getGoalSnapshot(goalId);
        if (!goalSnapshot) {
            return null;
        }
        return goalSnapshot.data() as Goal;
    } catch (error) {
        throw error;
    }
}

async function createGoal(goalData: Goal): Promise<Goal | null> {
    try {
        goalData = { ...goalData, ...normalizeDates(goalData) }
        const goalsTable = getGoalTable();
        const goal = await goalsTable.add(goalData);
        const addedGoal = await goal.get();
        if (addedGoal.exists) {
            return addedGoal.data()!;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

async function deleteGoal(goalId: string): Promise<boolean> {
    try {
        const goalsSnapshot = await getGoalSnapshot(goalId);

        if (!goalsSnapshot) {
            return false;
        }

        await goalsSnapshot.ref.delete();

        return true;
    } catch (error) {
        throw error;
    }
}


function normalizeDates(goalData: Partial<Goal>) {
    if (goalData.createdAt) {
        goalData.createdAt = new Date(goalData.createdAt);
    }
    if (goalData.updatedAt) {
        goalData.updatedAt = new Date(goalData.updatedAt);
    }

    if (goalData.endDate) {
        goalData.endDate = new Date(goalData.endDate);
    }

    if (goalData.startDate) {
        goalData.startDate = new Date(goalData.startDate);
    }

    return goalData;
}

async function updateGoal(goalId: string, goalData: Partial<Goal>): Promise<Goal | null> {
    try {
        const goalsSnapshot = await getGoalSnapshot(goalId);

        if (!goalsSnapshot) {
            return null;
        }

        goalData = normalizeDates(goalData);

        await goalsSnapshot.ref.update({ ...goalData, updatedAt: new Date() });
        const updateGoal = await goalsSnapshot.ref.get();

        return updateGoal.data() || null;
    } catch (error) {
        throw error;
    }
}

async function getActiveGoals(userId: string): Promise<Goal[]> {
    try {
        const goalsTable = getGoalTable();
        const goalsSnapshot = await goalsTable.where("userId", "==", userId).where("status", "==", GoalStatus.ACTIVE).get();
        if (!goalsSnapshot.empty) {
            let goal: Goal[] = [];
            goalsSnapshot.forEach((goalData) => {
                goal.push(goalData.data());
            });

            return goal;
        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}

async function getUpcomingGoals(userId: string): Promise<Goal[]> {
    try {
        const goalsTable = getGoalTable();
        const goalsSnapshot = await goalsTable.where("userId", "==", userId).where("startDate", ">", Timestamp.fromDate(new Date())).get();
        if (!goalsSnapshot.empty) {
            let goal: Goal[] = [];
            goalsSnapshot.forEach((goalData) => {
                goal.push(goalData.data());
            });

            return goal;
        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}

export const GoalRepository = {
    createGoal,
    updateGoal,
    deleteGoal,
    getActiveGoals,
    getUpcomingGoals,
    getGoal
};