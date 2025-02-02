import { v4 as uuidv4 } from "uuid";
import { GoalParameters } from "@/models/GoalParameters";
import { GoalType } from "@/models/enums/GoalType";
import { GoalStatus } from "@/models/enums/GoalStatus";
import { Timestamp } from "firebase-admin/firestore";

type GoalWithIdParameters = GoalParameters & {
    id?: string,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    startDate: Timestamp,
    endDate: Timestamp
};

export class FirebaseGoal {
    public static EMPTY_GOAL: FirebaseGoal = new FirebaseGoal({
        id: "",
        userId: "",
        name: "",
        description: "",
        goalType: GoalType.DAILY,
        status: GoalStatus.ACTIVE,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        endDate: Timestamp.now(),
        startDate: Timestamp.now(),
        progress: {}
    });

    public id: string;
    public userId: string;
    public name: string;
    public description?: string;
    public goalType: GoalType;
    public startDate: Timestamp;
    public endDate: Timestamp;
    public status: GoalStatus;
    public progress: Record<string, boolean>;
    public createdAt: Timestamp;
    public updatedAt: Timestamp;

    constructor(params: GoalWithIdParameters) {
        this.id = params.id || uuidv4().toString();
        this.name = params.name;
        this.description = params.description;
        this.status = params.status;
        this.progress = params.progress;
        this.goalType = params.goalType;
        this.userId = params.userId;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
        this.startDate = params.startDate;
        this.endDate = params.endDate;
    }
}