"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { createGoal } from "@/services/CreateGoal";
import { QUERY_KEYS } from "@/constants/QueryKeys";
import { Goal } from "@/models/Goal";
import { CreateGoalRequest } from "@/models/services/CreateGoalRequest";
import { GoalType } from "@/models/enums/GoalType";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { addDays, format, parse } from "date-fns";
import { isDateInBetweenRange } from "@/lib/utils";

type UseCreateGoalProps = {
    onSuccess: (response: Goal) => void;
}

export const useCreateGoal = (props: UseCreateGoalProps) => {
    const { onSuccess } = props;
    const { handleErrors } = useErrorHandler();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (goalData: CreateGoalRequest) => {
            const response = await createGoal(goalData);
            return {
                ...response.data,
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt),
                startDate: new Date(response.data.startDate),
                endDate: new Date(response.data.endDate)
            } as Goal;
        },
        onSuccess: (response) => {
            onSuccess(response);

            function updateGoals(oldGoals?: Goal[]) {
                if (oldGoals) {
                    const updatedGoals = [...oldGoals];
                    updatedGoals.push(response);
                    return updatedGoals;
                }
                return [response];
            }

            let includeInTodayGoals = false, includeInTomorrowGoals = false, includeInNext7DayGoals = false;

            if (response.goalType === GoalType.WEEKLY) {
                // check whether to include newly created goal in TodayGoals
                includeInTodayGoals = !!Object.keys(response.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(weekStartDate, weekEndDate, new Date())
                });

                // check whether to include newly created goal in TomorrowGoals
                includeInTomorrowGoals = !!Object.keys(response.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(weekStartDate, weekEndDate, addDays(new Date(), 1))
                });

                // check whether to include newly created goal in Next7DayGoals
                const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));
                includeInNext7DayGoals = !!Object.keys(response.progress).find(dateKey => {
                    const [weekStartKey, weekEndKey] = dateKey.split(" ");
                    const weekStartDate = parse(weekStartKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const weekEndDate = parse(weekEndKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return next7Days.find(day => isDateInBetweenRange(weekStartDate, weekEndDate, day))
                })
            } else {
                // check whether to include newly created goal in TodayGoals
                includeInTodayGoals = !!Object.keys(response.progress).find(dateKey => dateKey === format(new Date(), APP_CONSTANTS.DATE_FORMAT));

                // check whether to include newly created goal in TomorrowGoals
                includeInTomorrowGoals = !!Object.keys(response.progress).find(dateKey => dateKey === format(addDays(new Date(), 1), APP_CONSTANTS.DATE_FORMAT));

                // check whether to include newly created goal in Next7DayGoals
                const next7StartDate = addDays(new Date(), 1);
                const next7EndDate = addDays(next7StartDate, 6);
                includeInNext7DayGoals = !!Object.keys(response.progress).find(dateKey => {
                    const date = parse(dateKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    return isDateInBetweenRange(next7StartDate, next7EndDate, date);
                })
            }


            if (includeInTodayGoals) {
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_ACTIVE_GOALS], updateGoals);
            }

            if (includeInTomorrowGoals) {
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_TOMORROW_GOALS], updateGoals);
            }

            if (includeInNext7DayGoals) {
                queryClient.setQueryData<Goal[], string[], Goal[]>([QUERY_KEYS.FETCH_NEXT_7_DAY_GOALS], updateGoals);
            }
        },
        onError: (error) => handleErrors(error)
    });
};