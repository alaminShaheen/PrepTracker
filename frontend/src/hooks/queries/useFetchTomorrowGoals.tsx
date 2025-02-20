"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/QueryKeys";
import { fetchTomorrowGoals } from "@/services/FetchTomorrowGoals";

type UseFetchTomorrowGoalProps = {
    enabled: boolean;
}

export const useFetchTomorrowGoals = (props: UseFetchTomorrowGoalProps) => {
    const { enabled } = props;

    return useQuery(
        {
            queryKey: [QUERY_KEYS.FETCH_TOMORROW_GOALS],
            queryFn: async () => {
                const response = await fetchTomorrowGoals();
                return response.data;
            },
            enabled
        }
    );
};