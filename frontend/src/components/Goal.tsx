import React, { useMemo } from "react";
import { GoalStatus } from "@/models/enums/GoalStatus";
import { AlarmClock, CalendarPlus, Circle, CircleCheck, Pencil, Trash2 } from "lucide-react";
import { cn, getGoalDateKey } from "@/lib/utils";
import { Goal as GoalModel } from "@/models/Goal";
import { format } from "date-fns";

type GoalProps = {
    goal: GoalModel;
    onToggleGoal: (goal: GoalModel) => void;
    onEditGoal: (goal: GoalModel) => void;
    onDeleteGoal: (goalId: string) => void;
}

const Goal = (props: GoalProps) => {
    const { onToggleGoal, goal, onEditGoal, onDeleteGoal } = props;
    const dateKey = useMemo(() => getGoalDateKey(goal), [goal]);

    return (
        <div className="group flex gap-2 items-center p-2 my-4 cursor-pointer hover:bg-secondary hover:rounded-md"
             key={goal.id} onClick={() => onToggleGoal(goal)}>
            <span>
                {
                    goal.progress[dateKey] ?
                        <CircleCheck className="cursor-pointer size-6 text-green-600" /> :
                        <Circle className="cursor-pointer size-6 text-primary" />
                }
            </span>
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
                <div className="hidden group-hover:flex gap-4">
                    <Trash2 size={18} className="text-destructive" onClick={(event) => {
                        event.stopPropagation();
                        onDeleteGoal(goal.id);
                    }} />
                    <Pencil size={18} onClick={(event) => {
                        event.stopPropagation();
                        onEditGoal(goal);
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Goal;
