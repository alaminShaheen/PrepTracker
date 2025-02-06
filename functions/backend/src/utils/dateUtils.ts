import { isAfter, isBefore, isEqual, isSameDay } from "date-fns";

export function isDateInBetweenRange(startDate: Date, endDate: Date, referenceDate: Date) {
    return (isSameDay(referenceDate, startDate) || isAfter(referenceDate, startDate)) && (isSameDay(referenceDate, endDate) || isBefore(referenceDate, endDate));
}

export function doRangesOverlap(start1: Date, end1: Date, start2: Date, end2: Date) {
    return isBefore(start1, end2) && isAfter(end1, start2);

}