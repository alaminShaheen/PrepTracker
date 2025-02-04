"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/QueryKeys";
import { fetchActiveGoals } from "@/services/FetchActiveGoals";

type UseFetchActiveGoalsProps = {
    enabled: boolean;
}

export const useFetchActiveGoals = (props: UseFetchActiveGoalsProps) => {
    const { enabled } = props;

    return useQuery(
        {
            queryKey: [QUERY_KEYS.FETCH_ACTIVE_GOALS],
            queryFn: async () => {
                const response = await fetchActiveGoals();
                return response.data.map(goal => {
                    return {
                        ...goal,
                        createdAt: new Date(goal.createdAt),
                        updatedAt: new Date(goal.updatedAt),
                        startDate: new Date(goal.startDate),
                        endDate: new Date(goal.endDate)
                    };
                });
            },
            enabled
        }
    );
};