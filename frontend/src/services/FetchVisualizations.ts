import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { HeatmapEntry } from "@/models/HeatmapEntry";

export function fetchVisualizations() {
    return axiosInstance.get<object, AxiosResponse<HeatmapEntry[]>>(`/visualizations`);
}