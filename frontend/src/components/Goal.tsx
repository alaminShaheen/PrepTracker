import React, { useCallback, useMemo } from "react";
import { GoalStatus } from "@/models/enums/GoalStatus";
import { AlarmClock, CalendarPlus, Circle, CircleCheck, Clock, Pencil, Trash2 } from "lucide-react";
import { cn, isDateInBetweenRange } from "@/lib/utils";
import { Goal as GoalModel } from "@/models/Goal";
import { addDays, format, parse } from "date-fns";
import { GoalType } from "@/models/enums/GoalType";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { GoalTime } from "@/models/enums/GoalTime";

type GoalProps = {
    goal: GoalModel;
    onToggleGoal: (goal: GoalModel, dateKey: string) => void;
    onEditGoal: (goal: GoalModel) => void;
    onDeleteGoal: (goalId: string) => void;
    type: GoalTime;
}

const Goal = (props: GoalProps) => {
    const { onToggleGoal, goal, onEditGoal, onDeleteGoal, type } = props;

    const dateKey = useMemo(() => {
        if (type !== GoalTime.TODAY && goal.goalType !== GoalType.WEEKLY) return "";

        if (goal.goalType === GoalType.ONE_TIME || goal.goalType === GoalType.DAILY) {
            return format(new Date(), APP_CONSTANTS.DATE_FORMAT);
        } else {
            const referenceDate = type === GoalTime.TODAY ? new Date() : type === GoalTime.TOMORROW ? addDays(new Date(), 1) : Array.from({ length: 7 }, (_, index) => addDays(new Date(), index + 1));
            return Object.keys(goal.progress).find((dateRange) => {
                const [weekStart, weekEnd] = dateRange.split(" ").map(key => parse(key, APP_CONSTANTS.DATE_FORMAT, new Date()));
                if (Array.isArray(referenceDate)) {
                    return referenceDate.find(date => isDateInBetweenRange(weekStart, weekEnd, date));
                } else return isDateInBetweenRange(weekStart, weekEnd, referenceDate);
            }) || "";
        }
    }, [goal, type]);

    const onTogglePressed = useCallback(() => {
        if (type !== GoalTime.TODAY && goal.goalType !== GoalType.WEEKLY) return;
        return onToggleGoal(goal, dateKey);
    }, [type, goal, dateKey, onToggleGoal]);

    return (
        <div className={cn("group flex gap-2 items-center p-2 my-4", {
            "hover:bg-secondary hover:rounded-md cursor-pointer": type === GoalTime.TODAY
        })}
             key={goal.id} onClick={onTogglePressed}>
            {
                type !== GoalTime.TODAY && goal.goalType !== GoalType.WEEKLY ?
                    (<span><Clock className="cursor-not-allowed size-6 text-yellow-300" /></span>)
                    :
                    (<span>
                    {
                        goal.progress[dateKey] ?
                            <CircleCheck className="cursor-pointer size-6 text-green-600" /> :
                            <Circle className="cursor-pointer size-6 text-primary" />
                    }
                </span>)

            }
            <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-2">
                    <span className={cn("flex", {
                        "line-through decoration-destructive text-gray-400": goal.status === GoalStatus.FAILED,
                        "line-through decoration-gray-400 text-gray-400": goal.status === GoalStatus.COMPLETED
                    })}>
                        {goal.name}

                    </span>
                    {
                        goal.description &&
                        <span className="text-xs">
                            {goal.description}
                        </span>
                    }
                    <span className="flex gap-4">
                        <span title={`Created on ${format(goal.startDate, "dd-MM-yyyy")}`}
                              className="text-xs flex gap-1 text-green-700"><CalendarPlus
                            size={14} /> {format(goal.startDate, "dd-MM-yyyy")}</span>
                        <span title={`Expires on ${format(goal.startDate, "dd-MM-yyyy")}`}
                              className="text-xs flex gap-1 text-destructive"><AlarmClock
                            size={14} /> {format(goal.endDate, "dd-MM-yyyy")}</span>
                    </span>
                </div>
                <div className="flex gap-4">
                    <Trash2 size={18} className="text-destructive cursor-pointer" onClick={(event) => {
                        event.stopPropagation();
                        onDeleteGoal(goal.id);
                    }} />
                    <Pencil className="cursor-pointer" size={18} onClick={(event) => {
                        event.stopPropagation();
                        onEditGoal(goal);
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Goal;
