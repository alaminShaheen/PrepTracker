import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { Goal } from "@/models/Goal";
import { HeatmapEntry } from "@/models/HeatmapEntry";

export function fetchVisualizations() {
    return axiosInstance.get<object, AxiosResponse<HeatmapEntry[]>>(`/visualizations`);
}