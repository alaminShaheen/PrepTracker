import { v4 as uuidv4 } from "uuid";
import { GoalParameters } from "@/models/GoalParameters";
import { GoalType } from "@/models/enums/GoalType";
import { GoalStatus } from "@/models/enums/GoalStatus";

type GoalWithIdParameters = GoalParameters & {
    id?: string,
    createdAt: Date,
    updatedAt: Date,
    startDate: Date,
    endDate: Date
};

export class Goal {
    public static EMPTY_GOAL: Goal = new Goal({
        id: "",
        userId: "",
        name: "",
        description: "",
        goalType: GoalType.DAILY,
        status: GoalStatus.ACTIVE,
        updatedAt: new Date(),
        createdAt: new Date(),
        endDate: new Date(),
        startDate: new Date(),
        progress: {}
    });

    public id: string;
    public userId: string;
    public name: string;
    public description?: string;
    public goalType: GoalType;
    public startDate: Date;
    public endDate: Date;
    public status: GoalStatus;
    public progress: Record<string, boolean>;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(params: GoalWithIdParameters) {
        this.id = params.id || uuidv4().toString();
        this.name = params.name;
        this.description = params.description;
        this.status = params.status;
        this.progress = params.progress;
        this.endDate = params.endDate;
        this.startDate = params.startDate;
        this.goalType = params.goalType;
        this.userId = params.userId;
        this.createdAt = params.createdAt || new Date();
        this.updatedAt = params.updatedAt || new Date();
    }
}