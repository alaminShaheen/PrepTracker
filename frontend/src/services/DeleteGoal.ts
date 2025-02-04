import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";

export function deleteGoal(goalId: string) {
    return axiosInstance.delete<object, AxiosResponse<string>>(`/goal/${goalId}`);
}