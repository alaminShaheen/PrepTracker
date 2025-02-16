"use client";

import React, { useCallback, useState } from "react";
import { BicepsFlexed, Calendar, Calendar1, CalendarDays, Pickaxe, Plus } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/Routes";
import { usePathname } from "next/navigation";
import { cn, toastDateFormat } from "@/lib/utils";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateGoalModal from "@/components/CreateGoalModal";
import { useCreateGoal } from "@/hooks/mutations/useCreateGoal";
import { GoalForm } from "@/models/forms/GoalForm";
import { toast } from "sonner";

const Sidebar = () => {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {
        // isPending: isCreatingGoal,
        // isError: isCreatingGoalsError,
        // error: creatingGoalsError,
        mutate: createGoal
    } = useCreateGoal({
        onSuccess: () => {
            setIsModalOpen(false);
            toast.success("Goal created successfully.", {
                richColors: true,
                description: toastDateFormat(new Date())
            });
        }
    });

    const addGoal = useCallback((data: GoalForm) => {
        createGoal(data);
    }, [createGoal]);

    return (
        <div className="hidden lg:block w-[250px] border-border border-r-2 px-4 py-20">
            <ul className="flex flex-col gap-4">
                <li className={cn("cursor-pointer hover:text-primary p-2 rounded-md", { "bg-primary text-primary-foreground hover:text-primary-foreground": pathname === ROUTES.DASHBOARD.TODAY })}>
                    <Link href={ROUTES.DASHBOARD.TODAY} className="flex gap-2">
                        <Calendar1 /> Today
                    </Link>
                </li>
                <li className={cn("cursor-pointer hover:text-primary p-2 rounded-md", { "bg-primary text-primary-foreground hover:text-primary-foreground": pathname === ROUTES.DASHBOARD.TOMORROW })}>
                    <Link href={ROUTES.DASHBOARD.TOMORROW} className="flex gap-2">
                        <Calendar /> Tomorrow
                    </Link>
                </li>
                <li className={cn("cursor-pointer hover:text-primary p-2 rounded-md", { "bg-primary text-primary-foreground hover:text-primary-foreground": pathname === ROUTES.DASHBOARD.NEXT7DAYS })}>
                    <Link href={ROUTES.DASHBOARD.NEXT7DAYS} className="flex gap-2">
                        <CalendarDays /> Next 7 Days
                    </Link>
                </li>
                <li className={cn("cursor-pointer hover:text-primary p-2 rounded-md", { "bg-primary text-primary-foreground hover:text-primary-foreground": pathname === ROUTES.DASHBOARD.PROGRESS })}>
                    <Link href={ROUTES.DASHBOARD.PROGRESS} className="flex gap-2">
                        <BicepsFlexed /> Progress
                    </Link>
                </li>


                <hr className="my-2" />
                <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(prev => !prev)}>
                    {isModalOpen && <CreateGoalModal onCreateGoal={addGoal} />}
                    <li className={cn("cursor-pointer hover:text-primary p-2 rounded-md")}>
                        <DialogTrigger>
                        <span className="flex gap-2">
                            <Plus /> Add a Goal
                        </span>
                        </DialogTrigger>
                    </li>
                </Dialog>
            </ul>
        </div>
    );
};

export default Sidebar;
