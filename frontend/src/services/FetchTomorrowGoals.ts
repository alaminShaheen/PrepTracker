import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { Goal } from "@/models/Goal";

export function fetchTomorrowGoals() {
    return axiosInstance.get<object, AxiosResponse<Goal[]>>(`/goal/tomorrow`);
}