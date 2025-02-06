"use client";

import React, { Fragment, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Dot } from "lucide-react";
import { useFetchActiveGoals } from "@/hooks/queries/useFetchActiveGoals";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { GoalType } from "@/models/enums/GoalType";
import Goal from "@/components/Goal";
import { Goal as GoalModel } from "@/models/Goal";
import { getGoalDateKey, toastDateFormat } from "@/lib/utils";
import { useUpdateGoal } from "@/hooks/mutations/useUpdateGoal";
import { toast } from "sonner";
import GoalsSectionSkeleton from "@/components/GoalsSectionSkeleton";
import { useDeleteGoal } from "@/hooks/mutations/useDeleteGoal";
import { Dialog } from "@/components/ui/dialog";
import EditGoalModal from "@/components/EditGoalModal";
import { GoalTime } from "@/models/enums/GoalTime";

const Dashboard = () => {
    const [goalToEdit, setGoalToEdit] = useState<GoalModel>();
    const {
        data: activeGoals,
        isLoading: isFetchingActiveGoals,
        error: fetchActiveGoalsError,
        isError: isFetchActiveGoalsError
    } = useFetchActiveGoals({ enabled: true });
    const {
        isPending: isUpdatingGoal,
        isError: isUpdatingGoalsError,
        error: updatingGoalsError,
        mutate: updateGoal
    } = useUpdateGoal({
        onSuccess: () => {
            setGoalToEdit(undefined);
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

    useEffect(() => {
        if (isFetchActiveGoalsError) {
            handleErrors(fetchActiveGoalsError);
        } else if (isUpdatingGoalsError) {
            handleErrors(updatingGoalsError);
        } else if (isDeletingGoalsError) {
            handleErrors(deletingGoalsError);
        }
    }, [isFetchActiveGoalsError, handleErrors, isDeletingGoalsError, fetchActiveGoalsError, updatingGoalsError, isUpdatingGoalsError, deletingGoalsError]);

    const toggleGoal = useCallback((goal: GoalModel, dateKey: string) => {
        if (isFetchingActiveGoals || isUpdatingGoal) {
            return;
        }
        goal.progress[dateKey] = !goal.progress[dateKey];
        updateGoal(goal);
    }, [updateGoal, isFetchingActiveGoals, isUpdatingGoal]);

    const onDeleteGoal = useCallback((goalId: string) => {
        deleteGoal(goalId);
    }, [deleteGoal]);

    const onEditGoal = useCallback((goal: GoalModel) => {
        setGoalToEdit(goal);
    }, []);


    if (isFetchingActiveGoals || isDeletingGoal) {
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
                    Today's goals
                </h1>

                <div className="flex font-bold mt-8 text-lg">
                    <span>{format(new Date(), "do MMMM yyyy")}</span>
                    <Dot />
                    <span>{format(new Date(), "EEEE")}</span>
                </div>

                {
                    (activeGoals || []).filter(goal => goal.goalType === GoalType.ONE_TIME).length > 0 &&
                    <Fragment>
                        <div className="flex font-bold mt-8 text-lg">
                            One Time Goals
                        </div>
                        <hr className="my-2" />
                        {
                            (activeGoals || []).filter(goal => goal.goalType === GoalType.ONE_TIME).map((goal) => (
                                <Goal
                                    goal={goal}
                                    key={goal.id}
                                    onToggleGoal={toggleGoal}
                                    onDeleteGoal={onDeleteGoal}
                                    onEditGoal={onEditGoal}
                                    type={GoalTime.TODAY}
                                />
                            ))
                        }
                    </Fragment>
                }

                {
                    (activeGoals || []).filter(goal => goal.goalType === GoalType.DAILY).length > 0 &&
                    <Fragment>
                        <div className="flex font-bold mt-8 text-lg">
                            Daily Goals
                        </div>
                        <hr className="my-2" />
                        {
                            (activeGoals || []).filter(goal => goal.goalType === GoalType.DAILY).map((goal) => (
                                <Goal
                                    goal={goal}
                                    key={goal.id}
                                    onToggleGoal={toggleGoal}
                                    onDeleteGoal={onDeleteGoal}
                                    onEditGoal={onEditGoal}
                                    type={GoalTime.TODAY}
                                />
                            ))
                        }
                    </Fragment>
                }

                {
                    (activeGoals || []).filter(goal => goal.goalType === GoalType.WEEKLY).length > 0 &&
                    <Fragment>
                        <div className="flex font-bold mt-8 text-lg">
                            Weekly Goals
                        </div>
                        <hr className="my-2" />
                        {
                            (activeGoals || []).filter(goal => goal.goalType === GoalType.WEEKLY).map((goal) => (
                                <Goal
                                    goal={goal}
                                    key={goal.id}
                                    onToggleGoal={toggleGoal}
                                    onDeleteGoal={onDeleteGoal}
                                    onEditGoal={onEditGoal}
                                    type={GoalTime.TODAY}
                                />
                            ))
                        }
                    </Fragment>
                }
            </div>
        </Dialog>
    );
};

export default Dashboard;
