import axiosInstance from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";
import { UpdateSubscriptionResponse } from "@/models/services/UpdateSubscriptionResponse";

export function updateSubscription(shouldSubscribe: boolean, email: string) {
    if (shouldSubscribe) {
        return axiosInstance.get<object, AxiosResponse<UpdateSubscriptionResponse>>("auth/subscribe", { params: { email } });
    } else {
        return axiosInstance.get<object, AxiosResponse<UpdateSubscriptionResponse>>("auth/unsubscribe", { params: { email } });
    }
}