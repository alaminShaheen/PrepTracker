import { UserParameters } from "@/models/UserParameters";
import { v4 as uuidv4 } from "uuid";

type UserWithIdParameters = UserParameters & { id?: string, createdAt?: Date; subscribed?: boolean };

export class User {
    public static EMPTY_USER: User = new User({ email: "", id: "", firstname: "", lastname: "", subscribed: false });
    public id: string;
    public email: string;
    public firstname: string;
    public lastname: string;
    public createdAt: Date;
    public subscribed: boolean;

    constructor(params: UserWithIdParameters) {
        this.id = params.id || uuidv4().toString();
        this.email = params.email;
        this.firstname = params.firstname;
        this.lastname = params.lastname;
        this.createdAt = params.createdAt || new Date();
        this.subscribed = params.subscribed || true;
    }
}