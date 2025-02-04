import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { Goal } from "@/models/Goal";

export function fetchNext7DayGoals() {
    return axiosInstance.get<object, AxiosResponse<Goal[]>>(`/goal/next-7-days`);
}