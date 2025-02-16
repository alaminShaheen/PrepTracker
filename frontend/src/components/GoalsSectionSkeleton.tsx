import React, { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const GoalsSectionSkeleton = () => {
    return (
        <div className="max-w-xl space-y-10">
            <div className="flex flex-col gap-4">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-24 h-4" />
            </div>
            <div className="flex flex-col gap-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-full h-1" />

                <div className="flex flex-col gap-6">
                    {Array(10).fill(
                        <div className="flex w-full items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="w-full gap-2 flex flex-col">
                                <Skeleton className="w-full h-5" />
                                <Skeleton className="w-2/3 h-3" />
                            </div>
                        </div>
                    ).map((skeleton, index) => <Fragment key={index}>{skeleton}</Fragment>)}
                </div>

            </div>
        </div>
    );
};

export default GoalsSectionSkeleton;
