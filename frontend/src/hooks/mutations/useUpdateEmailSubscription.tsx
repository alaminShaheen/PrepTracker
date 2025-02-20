"use client";

import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { updateSubscription } from "@/services/UpdateSubscription";
import { useAuthContext } from "@/contexts/AuthContext";
import { UpdateSubscriptionResponse } from "@/models/services/UpdateSubscriptionResponse";

type UseUpdateEmailSubscriptionProps = {
    onSuccess: (data: UpdateSubscriptionResponse) => void;
}

export const useUpdateEmailSubscription = (props: UseUpdateEmailSubscriptionProps) => {
    const { onSuccess } = props;
    const { handleErrors } = useErrorHandler();
    const { setSubscribedToEmails } = useAuthContext();

    return useMutation({
        mutationFn: async (subscriptionInfo: { shouldSubscribe: boolean, email: string }) => {
            const response = await updateSubscription(subscriptionInfo.shouldSubscribe, subscriptionInfo.email);
            return response.data;
        },
        onSuccess: async (response) => {
            onSuccess(response);
            setSubscribedToEmails(response.subscriptionStatus);
        },
        onError: (error) => handleErrors(error)
    });
};