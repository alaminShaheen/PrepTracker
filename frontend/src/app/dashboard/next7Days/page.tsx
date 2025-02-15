"use client";

import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useUpdateGoal } from "@/hooks/mutations/useUpdateGoal";
import { toast } from "sonner";
import { toastDateFormat } from "@/lib/utils";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Goal as GoalModel } from "@/models/Goal";
import GoalsSectionSkeleton from "@/components/GoalsSectionSkeleton";
import { useFetchNext7DayGoals } from "@/hooks/queries/useFetchNext7DayGoals";
import { addDays, format } from "date-fns";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { Dot } from "lucide-react";
import { GoalType } from "@/models/enums/GoalType";
import Goal from "@/components/Goal";
import { useDeleteGoal } from "@/hooks/mutations/useDeleteGoal";
import { Dialog } from "@/components/ui/dialog";
import EditGoalModal from "@/components/EditGoalModal";
import { GoalTime } from "@/models/enums/GoalTime";

const Next7Days = () => {
    const [goalToEdit, setGoalToEdit] = useState<GoalModel>();
    const {
        data: next7DayGoals,
        isLoading: isFetchingGoals,
        error: fetchGoalsError,
        isError: isFetchGoalsError
    } = useFetchNext7DayGoals({ enabled: true });

    const {
        isPending: isUpdatingGoal,
        isError: isUpdatingGoalsError,
        error: updatingGoalsError,
        mutate: updateGoal
    } = useUpdateGoal({
        onSuccess: () => {
            toast.success("Goal updated successfully.", {
                richColors: true,
                description: toastDateFormat(new Date())
            });
        }
    });

    const {
        isPending: isDeletingGoal,
        isError: isDeletingGoalsError,
        error: deletingGoalsError,
        mutate: deleteGoal
    } = useDeleteGoal({
        onSuccess: () => {
            toast.success("Goal deleted successfully.", {
                richColors: true,
                description: toastDateFormat(new Date())
            });
        }
    });

    const { handleErrors } = useErrorHandler();

    const toggleGoal = useCallback((goal: GoalModel, dateKey: string) => {
        if (isFetchingGoals || isUpdatingGoal) {
            return;
        }
        goal.progress[dateKey] = !goal.progress[dateKey];
        updateGoal(goal);
    }, [updateGoal, isFetchingGoals, isUpdatingGoal]);

    const onDeleteGoal = useCallback((goalId: string) => {
        deleteGoal(goalId);
    }, [deleteGoal]);

    const onEditGoal = useCallback((goal: GoalModel) => {
        setGoalToEdit(goal);
    }, []);

    useEffect(() => {
        if (isFetchGoalsError) {
            handleErrors(fetchGoalsError);
        } else if (isUpdatingGoalsError) {
            handleErrors(updatingGoalsError);
        } else if (isDeletingGoalsError) {
            handleErrors(deletingGoalsError);
        }
    }, [isFetchGoalsError, handleErrors, fetchGoalsError, updatingGoalsError, isUpdatingGoalsError, isDeletingGoalsError, deletingGoalsError]);


    if (isFetchingGoals || isDeletingGoal) {
        return (
            <div className="gap-4 w-2/3 mx-auto py-16">
                <GoalsSectionSkeleton />
            </div>
        );
    }
    return (
        <Dialog open={!!goalToEdit} onOpenChange={() => setGoalToEdit(prev => prev ? undefined : prev)}>
            {
                !!goalToEdit &&
                <EditGoalModal
                    data={goalToEdit}
                    onEditGoal={(goalData) => updateGoal({ ...goalToEdit, ...goalData })}
                />
            }
            <div className="gap-4 w-2/3 mx-auto">
                <h1 className="text-3xl font-bold">
                    Next 7 day&apos;s goals
                </h1>

                <div className="flex font-bold mt-8 text-lg">
                    <span>{format(addDays(new Date(), 1), APP_CONSTANTS.DATE_FORMAT)}</span>
                    <Dot />
                    <span>{format(addDays(new Date(), 1), "EEEE")}</span>
                </div>

                {
                    (next7DayGoals || []).filter(goal => goal.goalType === GoalType.ONE_TIME).length > 0 &&
                    <Fragment>
                        <div className="flex font-bold mt-8 text-lg">
                            One Time Goals
                        </div>
                        <hr className="my-2" />
                        {
                            (next7DayGoals || []).filter(goal => goal.goalType === GoalType.ONE_TIME).map((goal) => (
                                <Goal
                                    goal={goal}
                                    key={goal.id}
                                    onToggleGoal={toggleGoal}
                                    onDeleteGoal={onDeleteGoal}
                                    onEditGoal={onEditGoal}
                                    type={GoalTime.NEXT_7_DAYS}
                                />
                            ))
                        }
                    </Fragment>
                }

                {
                    (next7DayGoals || []).filter(goal => goal.goalType === GoalType.DAILY).length > 0 &&
                    <Fragment>
                        <div className="flex font-bold mt-8 text-lg">
                            Daily Goals
                        </div>
                        <hr className="my-2" />
                        {
                            (next7DayGoals || []).filter(goal => goal.goalType === GoalType.DAILY).map((goal) => (
                                <Goal
                                    goal={goal}
                                    key={goal.id}
                                    onToggleGoal={toggleGoal}
                                    onDeleteGoal={onDeleteGoal}
                                    onEditGoal={onEditGoal}
                                    type={GoalTime.NEXT_7_DAYS}
                                />
                            ))
                        }
                    </Fragment>
                }

                {
                    (next7DayGoals || []).filter(goal => goal.goalType === GoalType.WEEKLY).length > 0 &&
                    <Fragment>
                        <div className="flex font-bold mt-8 text-lg">
                            Weekly Goals
                        </div>
                        <hr className="my-2" />
                        {
                            (next7DayGoals || []).filter(goal => goal.goalType === GoalType.WEEKLY).map((goal) => (
                                <Goal
                                    goal={goal}
                                    key={goal.id}
                                    onToggleGoal={toggleGoal}
                                    onDeleteGoal={onDeleteGoal}
                                    onEditGoal={onEditGoal}
                                    type={GoalTime.NEXT_7_DAYS}
                                />
                            ))
                        }
                    </Fragment>
                }
            </div>
        </Dialog>
    );
};

export default Next7Days;
