"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { QUERY_KEYS } from "@/constants/QueryKeys";
import { deleteGoal } from "@/services/DeleteGoal";
import { Goal } from "@/models/Goal";

type UseDeleteGoalProps = {
    onSuccess: (response: string) => void;
}

export const useDeleteGoal = (props: UseDeleteGoalProps) => {
    const { onSuccess } = props;
    const { handleErrors } = useErrorHandler();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (goalId: string) => {
            const response = await deleteGoal(goalId);
            return response.data;
        },
        onSuccess: (deletedGoalId) => {
            onSuccess(deletedGoalId);
            function deleteGoal(oldGoals?: Goal[]) {
                if (oldGoals && oldGoals.length > 0) {
                    console.log(oldGoals.filter(oldGoal => oldGoal.id !== deletedGoalId));
                    return oldGoals.filter(oldGoal => oldGoal.id !== deletedGoalId);
                }
                return [];
            }

            if (deletedGoalId) {
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_ACTIVE_GOALS], deleteGoal);
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_TOMORROW_GOALS], deleteGoal);
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_NEXT_7_DAY_GOALS], deleteGoal);
            }

        },
        onError: (error) => handleErrors(error)
    });
};