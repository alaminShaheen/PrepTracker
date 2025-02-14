import { UserParameters } from "@/models/UserParameters";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase-admin/firestore";

type UserWithIdParameters = UserParameters & { id?: string, createdAt: Timestamp, subscribed: boolean };

export class FirebaseUser {
    public static EMPTY_USER: FirebaseUser = new FirebaseUser({
        email: "",
        id: "",
        firstname: "",
        lastname: "",
        createdAt: Timestamp.now(),
        subscribed: false
    });
    public id: string;
    public email: string;
    public firstname: string;
    public lastname: string;
    public createdAt: Timestamp;
    public subscribed: boolean;

    constructor(params: UserWithIdParameters) {
        this.id = params.id || uuidv4().toString();
        this.email = params.email;
        this.firstname = params.firstname;
        this.lastname = params.lastname;
        this.createdAt = params.createdAt;
        this.subscribed = params.subscribed
    }
}