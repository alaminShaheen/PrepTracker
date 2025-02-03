"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Mail, RefreshCcw } from "lucide-react";
import React, { useCallback } from "react";

import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/Routes";
import { Button } from "@/components/ui/button";
import { PasswordResetForm } from "@/models/forms/PasswordResetForm";
import { cn, toastDateFormat } from "@/lib/utils";
import { usePasswordResetMutation } from "@/hooks/mutations/usePasswordResetMutation";
import InputWithIcon from "@/components/ui/input-with-Icon";

const PasswordReset = () => {
    const {
        register,
        formState: { errors },
        handleSubmit,
        setError
    } = useForm<PasswordResetForm>({
        defaultValues: { email: "" }
    });
    const router = useRouter();

    const onPasswordResetSuccess = useCallback(() => {
        toast.success(`A password reset link has been sent to your email`, {
            richColors: true,
            description: toastDateFormat(new Date()),
            action: {
                label: "Close",
                onClick: () => null
            }
        });
        router.push(ROUTES.LOGIN);
    }, [router]);

    const { mutate, isPending } = usePasswordResetMutation({ onPasswordResetSuccess, setError });

    const onSubmit = useCallback(async (formData: PasswordResetForm) => {
        mutate(formData);
    }, [mutate]);

    return (
        <div className="flex w-full justify-center items-center flex-1 flex-col gap-4">
            <h1 className="text-2xl">Reset Password</h1>
            <form className="w-full p-4 md:w-1/3 lg:w-[450px] flex flex-col gap-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <Label htmlFor="email" className={cn({ "text-destructive": errors.email })}>Email</Label>
                    <InputWithIcon
                        className={cn("border mt-1", {
                            "border-border": !errors.email,
                            "border-destructive": errors.email
                        })}
                        id="email"
                        type="email"
                        Icon={<Mail size={16} />}
                        {...register("email", { required: "Email is required." })} />
                    {errors.email && (
                        <span className="text-xs text-destructive">{errors.email.message}</span>
                    )}
                </div>
                <Button variant="default" type="submit" className="w-full md:w-1/3 mx-auto" disabled={isPending}>
                    {isPending && <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                </Button>
            </form>
        </div>
    );
};

export default PasswordReset;
