"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/QueryKeys";
import { fetchVisualizations } from "@/services/FetchVisualizations";

type UseFetchVisualizationProps = {
    enabled: boolean;
}

export const useFetchVisualizations = (props: UseFetchVisualizationProps) => {
    const { enabled } = props;

    return useQuery(
        {
            queryKey: [QUERY_KEYS.FETCH_VISUALIZATIONS],
            queryFn: async () => {
                const response = await fetchVisualizations();
                return response.data;
            },
            enabled
        }
    );
};