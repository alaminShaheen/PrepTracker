"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import GoalsSectionSkeleton from "@/components/GoalsSectionSkeleton";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { endOfYear, format, parse, startOfYear } from "date-fns";
import { useFetchVisualizations } from "@/hooks/queries/useFetchVisualizations";
import { APP_CONSTANTS } from "@/constants/AppConstants";

const Progress = () => {
    const {
        data: visualizations,
        isLoading: isFetchingVisualizations,
        error: fetchVisualizationsError,
        isError: isFetchVisualizationsError
    } = useFetchVisualizations({ enabled: true });

    const { handleErrors } = useErrorHandler();

    useEffect(() => {
        if (isFetchVisualizationsError) {
            handleErrors(fetchVisualizationsError);
        }
    }, [handleErrors, isFetchVisualizationsError, fetchVisualizationsError]);

    const maxCount = useMemo(() => Math.max(...(visualizations?.map(d => d.tasksCompleted) || []), 1), [visualizations]);

    const getColor = useCallback((count: number) => {
        if (!count) return "#E5E7EB"; // Light gray for no activity
        if (count < maxCount * 0.2) return "#D1FAE5"; // Light green
        if (count < maxCount * 0.4) return "#86EFAC";
        if (count < maxCount * 0.6) return "#34D399";
        if (count < maxCount * 0.8) return "#059669";
        return "#065F46"; // Darkest green for high activity
    }, [maxCount]);


    if (isFetchingVisualizations) {
        return (
            <div className="gap-4 w-2/3 mx-auto py-16">
                <GoalsSectionSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full px-10">
            <h1 className="text-lg font-bold">
                Track your progress
            </h1>
            <CalendarHeatmap
                startDate={startOfYear(new Date())}
                endDate={endOfYear(new Date())}
                values={visualizations?.map((visualization) => {
                    const date = parse(visualization.dateKey, APP_CONSTANTS.DATE_FORMAT, new Date());
                    const dateKey = format(date, "yyyy-MM-dd");
                    return { date: dateKey, count: visualization.tasksCompleted };
                }) || []}
                titleForValue={(value) => {
                    const count = value?.count || 0;
                    if (value?.date) {
                        const date = parse(value.date, "yyyy-MM-dd", new Date());
                        const dateKey = format(date, APP_CONSTANTS.DATE_FORMAT);
                        return `${dateKey}: ${count} Task${count !== 1 ? "s" : ""} completed`;
                    }
                    return `${count} Task${count !== 1 ? "s" : ""} completed`;
                }}
                transformDayElement={(rect, value) => {
                    // Apply inline styles dynamically
                    const color = getColor(value?.count || 0);
                    return React.cloneElement(rect as React.ReactElement<SVGRectElement>, {
                        style: { fill: color, transition: "fill 0.3s ease-in-out" } as CSSStyleDeclaration
                    });
                }}
            />
        </div>
    );
};

export default Progress;
