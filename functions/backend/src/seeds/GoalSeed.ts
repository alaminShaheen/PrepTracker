import "module-alias/register";
import { Goal } from "@/models/Goal";
import { CollectionReference, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirebaseGoal } from "@/models/Firebase/FirebaseGoal";
import { getDatabaseInstance } from "../database";
import { DATABASE_CONSTANTS } from "@/constants/databaseConstants";
import { v4 as uuidv4 } from "uuid";
import { GoalType } from "@/models/enums/GoalType";
import { addDays, differenceInCalendarDays, format, isAfter, isBefore, min, subDays } from "date-fns";
import { faker } from "@faker-js/faker";
import { GoalStatus } from "@/models/enums/GoalStatus";
import { APP_CONSTANTS } from "@/constants/appConstants";
import { User } from "@/models/User";
import { FirebaseUser } from "@/models/Firebase/FirebaseUser";
import { AuthRepository } from "@/repositories/AuthRepository";
import { GoalService } from "@/services/GoalService";
import sgMail from "@sendgrid/mail";
import { SENDER_EMAIL, TWILIO_SENDGRID_API_KEY } from "@/configs/config";


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

const firestoreUserConverter = {
    toFirestore: function(user: User) {
        return Object.assign({}, user);
    },
    fromFirestore: function(snapshot: QueryDocumentSnapshot) {
        const data = snapshot.data() as FirebaseUser;
        return new User({ ...data, createdAt: data.createdAt.toDate() });
    }
};

const databaseInstance = getDatabaseInstance();
const goalsTable = databaseInstance.collection(DATABASE_CONSTANTS.GOALS_TABLE).withConverter(firestoreGoalConverter) as CollectionReference<Goal, FirebaseGoal>;
const usersTable = databaseInstance.collection(DATABASE_CONSTANTS.USERS_TABLE).withConverter(firestoreUserConverter) as CollectionReference<User, FirebaseUser>;

// generate completed daily goals
// generate failed daily goals
// generate active daily goals
// generate partially completed daily goals
// generate failed weekly goals
// generate partially completed weekly goals
// generate completed weekly goals
// generate active weekly goals
// generate completed one time goals
// generate failed one time goals
// generate active one time goals

async function seedWeeklyGoals(amount: number) {
    try {
        const batch = databaseInstance.batch();

        for (let i = 0; i < amount; i++) {
            const goalDocRef = databaseInstance.collection(DATABASE_CONSTANTS.GOALS_TABLE).doc();
            const startDate = subDays(new Date(), faker.number.int({ min: 10, max: 12 }));
            const endDate = addDays(new Date(), faker.number.int({ min: 20, max: 40 }));
            const goalProgress = {} as Record<string, boolean>;

            let currentWeekStart = startDate;
            while (isAfter(endDate, currentWeekStart)) {
                const currentWeekEnd = min([addDays(currentWeekStart, 6), endDate]);
                const weekKey = `${format(currentWeekStart, APP_CONSTANTS.DATE_FORMAT)} ${format(currentWeekEnd, APP_CONSTANTS.DATE_FORMAT)}`;
                goalProgress[weekKey] = isAfter(currentWeekStart, new Date()) ? false : faker.datatype.boolean(0.5);
                currentWeekStart = addDays(currentWeekStart, 7);
            }

            const newGoal = new Goal({
                id: uuidv4(),
                goalType: GoalType.WEEKLY,
                startDate: startDate,
                endDate: endDate,
                createdAt: subDays(startDate, 3),
                name: faker.lorem.words(),
                description: faker.lorem.sentence(),
                progress: goalProgress,
                status: GoalStatus.ACTIVE,
                updatedAt: subDays(startDate, 3),
                userId: "GBcACwffidP0bpKNEuNxyouFX5C3"
            });

            batch.set(goalDocRef, { ...newGoal });
            console.log("setting");
        }

        await batch.commit();
    } catch (error) {
        console.log(error);
    }
}

async function seedDailyGoals(amount: number) {
    try {
        const batch = databaseInstance.batch();

        for (let i = 0; i < amount; i++) {
            const goalDocRef = databaseInstance.collection(DATABASE_CONSTANTS.GOALS_TABLE).doc();
            const startDate = subDays(new Date(), faker.number.int({ min: 100, max: 120 }));
            const endDate = addDays(new Date(), faker.number.int({ min: 5, max: 10 }));
            const goalProgress = {} as Record<string, boolean>;

            const totalDays = differenceInCalendarDays(new Date(), startDate);
            for (let i = 0; i <= totalDays; i++) {
                const currentDate = addDays(new Date(startDate), i);
                const dateString = format(currentDate, APP_CONSTANTS.DATE_FORMAT);
                goalProgress[dateString] = faker.datatype.boolean(0.5);
            }

            const newGoal = new Goal({
                id: uuidv4(),
                goalType: GoalType.DAILY,
                startDate: startDate,
                endDate: endDate,
                createdAt: subDays(startDate, 3),
                name: faker.lorem.words(),
                description: faker.lorem.sentence(),
                progress: goalProgress,
                status: GoalStatus.ACTIVE,
                updatedAt: subDays(startDate, 3),
                userId: "GBcACwffidP0bpKNEuNxyouFX5C3"
            });

            batch.set(goalDocRef, { ...newGoal });
            console.log("setting");
        }

        await batch.commit();
    } catch (error) {
        console.log(error);
    }
}

async function seedOneTimeGoals(amount: number) {
    try {
        const batch = databaseInstance.batch();

        for (let i = 0; i < amount; i++) {
            const goalDocRef = databaseInstance.collection(DATABASE_CONSTANTS.GOALS_TABLE).doc();
            const startDate = subDays(new Date(), faker.number.int({ min: 10, max: 20 }));
            const endDate = startDate;
            const goalProgress = {} as Record<string, boolean>;

            const dateString = format(startDate, APP_CONSTANTS.DATE_FORMAT);
            goalProgress[dateString] = false;

            const newGoal = new Goal({
                id: uuidv4(),
                goalType: GoalType.ONE_TIME,
                startDate: startDate,
                endDate: endDate,
                createdAt: subDays(startDate, 3),
                name: faker.lorem.words(),
                description: faker.lorem.sentence(),
                progress: goalProgress,
                status: GoalStatus.FAILED,
                updatedAt: subDays(startDate, 3),
                userId: "GBcACwffidP0bpKNEuNxyouFX5C3"
            });

            batch.set(goalDocRef, { ...newGoal });
            console.log("setting");
        }

        await batch.commit();
    } catch (error) {
        console.log(error);
    }
}

async function seedDatabase() {
    try {
        for (let i = 0; i < 6; i++) {
            const startDate = subDays(new Date(), 100);
            const endDate = addDays(startDate, faker.number.int({ min: 6, max: 10 }));
            const goalProgress = {} as Record<string, boolean>;


            const newGoal = new Goal({
                id: uuidv4(),
                goalType: GoalType.WEEKLY,
                startDate: startDate,
                endDate: endDate,
                createdAt: subDays(startDate, 3),
                name: faker.lorem.words(),
                description: faker.lorem.sentence(),
                progress: goalProgress,
                status: GoalStatus.FAILED,
                updatedAt: subDays(startDate, 3),
                userId: "GBcACwffidP0bpKNEuNxyouFX5C3"
            });

            const goal = await goalsTable.add(newGoal);
            const addedGoal = await goal.get();
            if (addedGoal.exists) {
                console.log(`Created goal ${i + 1}`);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function cleanDatabase() {
    try {
        const batch = databaseInstance.batch();
        // const usersSnapshot = await usersTable.get();
        // const users: User[] = [];
        //
        // if (!usersSnapshot.empty) {
        //     usersSnapshot.forEach(userDoc => {
        //         users.push(userDoc.data());
        //     });
        // }

        const goalsSnapshot = await goalsTable.get();
        if (!goalsSnapshot.empty) {
            goalsSnapshot.forEach((goalDoc) => {
                const goalData = goalDoc.data();
                if (
                    goalData.status !== GoalStatus.ACTIVE ||
                    isBefore(format(goalData.endDate, APP_CONSTANTS.DATE_FORMAT), new Date())
                ) {
                    batch.delete(goalDoc.ref);
                }
            });
            await batch.commit();
        }
    } catch (error) {
        console.log(error);
    }
}


async function batchUpdateGoals() {
    try {
        const goalsSnapshot = await goalsTable.where("goalType", "==", GoalType.WEEKLY).get();
        const batch = databaseInstance.batch();

        if (!goalsSnapshot.empty) {
            goalsSnapshot.forEach((goalDoc) => {
                batch.delete(goalDoc.ref);
            });
            await batch.commit();
        } else {
            throw new Error("Could not update goals");
        }
    } catch (error) {
        console.log(error);
    }
}

async function test() {
    try {
        sgMail.setApiKey(TWILIO_SENDGRID_API_KEY);
        const allUsers = await AuthRepository.getAllUsers();
        const userData: User[] = [];

        allUsers.forEach((user) => {
            const data = user.data();
            userData.push(data);
        });

        for (const userDatum of userData) {
            await GoalService.cleanExpiredGoals(userDatum.id);
            if (userDatum.subscribed) {
                const result = await GoalService.getUserEmailGoals(userDatum);
                if (result) {
                    const email = await GoalService.createEmailTemplate(userDatum, result.activeTodayGoals, result.activeWeeklyGoals, result.activeOneTimeGoals);
                    const response = await sgMail.send({
                        to: "glamborghini74@gmail.com",
                        from: SENDER_EMAIL,
                        subject: "Your Tasks for Today",
                        html: email
                    });
                    console.log(response);
                }
            }
        }
        console.log("Emails sent successfully!");
    } catch (error) {
        console.error("Error sending emails:", error);
    }
}

// void seedWeeklyGoals(6);
// void seedDailyGoals(6);
// void cleanDatabase();
void test();
// void batchUpdateGoals();
