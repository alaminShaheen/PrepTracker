import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { Goal } from "@/models/Goal";

export function fetchActiveGoals() {
    return axiosInstance.get<object, AxiosResponse<Goal[]>>(`/goal/active`);
}