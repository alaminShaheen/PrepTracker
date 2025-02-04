"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/QueryKeys";
import { fetchActiveGoals } from "@/services/FetchActiveGoals";
import { fetchTomorrowGoals } from "@/services/FetchTomorrowGoals";
import { fetchNext7DayGoals } from "@/services/FetchNext7DayGoals";

type UseFetchNext7DayGoalsProps = {
    enabled: boolean;
}

export const useFetchNext7DayGoals = (props: UseFetchNext7DayGoalsProps) => {
    const { enabled } = props;

    return useQuery(
        {
            queryKey: [QUERY_KEYS.FETCH_NEXT_7_DAY_GOALS],
            queryFn: async () => {
                const response = await fetchNext7DayGoals();
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
            enabled,
        }
    );
};