import { LoginForm } from "@/models/forms/LoginForm";
import { AxiosResponse } from "axios";
import { LoginResponse } from "@/models/services/LoginResponse";
import axiosInstance from "@/lib/axiosInstance";

export function login(formData: LoginForm) {
    return axiosInstance.post<object, AxiosResponse<LoginResponse>>("/auth/login", formData);
}