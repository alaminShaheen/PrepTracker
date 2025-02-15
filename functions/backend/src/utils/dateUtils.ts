import { isAfter, isBefore, isEqual, isSameDay } from "date-fns";

export function isDateInBetweenRange(startDate: Date, endDate: Date, referenceDate: Date) {
    return (isSameDay(referenceDate, startDate) || isAfter(referenceDate, startDate)) && (isSameDay(referenceDate, endDate) || isBefore(referenceDate, endDate));
}