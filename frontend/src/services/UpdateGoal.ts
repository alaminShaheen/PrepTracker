import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { Goal } from "@/models/Goal";

export function updateGoal(goalId: string, goalData: Partial<Goal>) {
    return axiosInstance.put<object, AxiosResponse<Goal>, Partial<Goal>>(`/goal/${goalId}`, goalData);
}