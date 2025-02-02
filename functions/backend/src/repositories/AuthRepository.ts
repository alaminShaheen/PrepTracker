import { getDatabaseInstance } from "../database";
import { CollectionReference, QueryDocumentSnapshot } from "firebase-admin/firestore";

import { User } from "@/models/User";
import { FirebaseUser } from "@/models/Firebase/FirebaseUser";
import { DATABASE_CONSTANTS } from "@/constants/databaseConstants";

const firestoreUserConverter = {
    toFirestore: function(user: User) {
        return Object.assign({}, user);
    },
    fromFirestore: function(snapshot: QueryDocumentSnapshot) {
        const data = snapshot.data() as FirebaseUser;
        return new User({ ...data, createdAt: data.createdAt.toDate() });
    }
};

function getUserTable() {
    try {
        const databaseInstance = getDatabaseInstance();
        return databaseInstance.collection(DATABASE_CONSTANTS.USERS_TABLE).withConverter(firestoreUserConverter) as CollectionReference<User, FirebaseUser>;
    } catch (error) {
        throw error;
    }
}


async function createUser(userInfo: User) {
    try {
        const usersTable = getUserTable();
        return await usersTable.add(userInfo);
    } catch (error: any) {
        throw error;
    }
}

async function findUserRecord(userId: string) {
    try {
        const usersTable = getUserTable();
        const userSnapshot = await usersTable.where("id", "==", userId).get();
        if (!userSnapshot.empty) {
            let user: QueryDocumentSnapshot<User, FirebaseUser> | null = null;
            userSnapshot.forEach((userData) => {
                user = userData;
            });

            if (!user) return null;

            return user as QueryDocumentSnapshot<User, FirebaseUser> | null;
        } else {
            return null;
        }
    } catch (error: any) {
        throw error;
    }
}

async function getUser(userId: string) {
    try {
        const userSnapshot = await findUserRecord(userId);

        if (!userSnapshot || !userSnapshot) return null;
        if (userSnapshot?.exists) {
            return userSnapshot.data();
        } else {
            return null;
        }
    } catch (error: any) {
        throw error;
    }
}

async function updateUser(updatedUserInfo: User) {
    try {
        const usersTable = getUserTable();
        const userSnapshot = await findUserRecord(updatedUserInfo.id);

        if (!userSnapshot || !userSnapshot.exists) {
            return null;
        }

        await usersTable.doc(userSnapshot.id).update(updatedUserInfo);
        return await findUserRecord(updatedUserInfo.id);
    } catch (error: any) {
        throw error;
    }
}

export const AuthRepository = {
    createUser,
    getUser,
    updateUser
};