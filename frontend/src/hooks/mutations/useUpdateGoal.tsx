"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { updateGoal } from "@/services/UpdateGoal";
import { Goal } from "@/models/Goal";
import { QUERY_KEYS } from "@/constants/QueryKeys";
import { GoalType } from "@/models/enums/GoalType";
import { addDays, format, parse } from "date-fns";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { isDateInBetweenRange } from "@/lib/utils";
import { useFetchVisualizations } from "@/hooks/queries/useFetchVisualizations";

type UseUpdateGoalProps = {
    onSuccess?: (response: Goal) => void;
}

export const useUpdateGoal = (props: UseUpdateGoalProps) => {
    const { onSuccess } = props;
    const { handleErrors } = useErrorHandler();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (goalData: Goal) => {
            const response = await updateGoal(goalData.id, goalData);
            return {
                ...response.data,
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt),
                startDate: new Date(response.data.startDate),
                endDate: new Date(response.data.endDate)
            } as Goal;
        },
        onSuccess: (response) => {
            onSuccess?.(response);

            function addUpdatedGoal(oldGoals?: Goal[]) {
                if (oldGoals) {
                    return oldGoals.map(oldGoal => {
                        if (oldGoal.id === response.id) return response;
                        return oldGoal;
                    })
                }
                return [response];
            }

            function deleteUpdatedGoal(oldGoals?: Goal[]) {
                if (oldGoals) {
                    return oldGoals.filter(oldGoal => oldGoal.id !== response.id)
                }
                return [response];
            }

            let includeInTodayGoals = false, includeInTomorrowGoals = false, includeInNext7DayGoals = false;

            if (response.goalType === GoalType.WEEKLY) {
                // check whether to include updated goal in TodayGoals
                includeInTodayGoals = !!Object.keys(response.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(weekStartDate, weekEndDate, new Date())
                });

                // check whether to include updated goal in TomorrowGoals
                includeInTomorrowGoals = !!Object.keys(response.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(weekStartDate, weekEndDate, addDays(new Date(), 1))
                });

                // check whether to include updated goal in Next7DayGoals
                const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));
                includeInNext7DayGoals = !!Object.keys(response.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return next7Days.find(day => isDateInBetweenRange(weekStartDate, weekEndDate, day))
                })
            } else {
                // check whether to include updated goal in TodayGoals
                includeInTodayGoals = !!Object.keys(response.progress).find(dateKey => dateKey === format(new Date(), APP_CONSTANTS.DATE_FORMAT));

                // check whether to include updated goal in TomorrowGoals
                includeInTomorrowGoals = !!Object.keys(response.progress).find(dateKey => dateKey === format(addDays(new Date(), 1), APP_CONSTANTS.DATE_FORMAT));

                // check whether to include updated goal in Next7DayGoals
                const next7StartDate = addDays(new Date(), 1);
                const next7EndDate = addDays(next7StartDate, 6);
                includeInNext7DayGoals = !!Object.keys(response.progress).find(dateKey => {
                    const date = parse(dateKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(next7StartDate, next7EndDate, date);
                })
            }

            if (includeInTodayGoals) {
                // add to today goals if updated goal has become a today goal
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_ACTIVE_GOALS], addUpdatedGoal);
            } else {
                // else delete if updated goal has is no longer a today goal
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_ACTIVE_GOALS], deleteUpdatedGoal);
            }

            if (includeInTomorrowGoals) {
                // add to tomorrow goals if updated goal has become a tomorrow goal
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_TOMORROW_GOALS], addUpdatedGoal);
            } else {
                // else delete if updated goal has is no longer a tomorrow goal
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_TOMORROW_GOALS], deleteUpdatedGoal);
            }

            if (includeInNext7DayGoals) {
                // add to next7Day goals if updated goal has become a next7Day goal
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_NEXT_7_DAY_GOALS], addUpdatedGoal);
            } else {
                // else delete if updated goal has is no longer a next7Day goal
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_NEXT_7_DAY_GOALS], deleteUpdatedGoal);
            }

            void queryClient.refetchQueries({queryKey: [QUERY_KEYS.FETCH_VISUALIZATIONS]})
        },
        onError: () => {
            handleErrors(new Error("There was an error updating the goal"));
        }
    });
};