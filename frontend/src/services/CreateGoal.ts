import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { CreateGoalRequest } from "@/models/services/CreateGoalRequest";
import { Goal } from "@/models/Goal";

export function createGoal(goalData: CreateGoalRequest) {
    return axiosInstance.post<object, AxiosResponse<Goal>, CreateGoalRequest>("/goal/create", goalData);
}