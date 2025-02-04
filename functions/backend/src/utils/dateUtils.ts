import { isAfter, isBefore } from "date-fns";

export function isDateInBetweenRange(startDate: Date, endDate: Date, referenceDate: Date) {
    return isAfter(referenceDate, startDate) && isBefore(referenceDate, endDate);
}

export function doRangesOverlap(start1: Date, end1: Date, start2: Date, end2: Date) {
    return isBefore(start1, end2) && isAfter(end1, start2);

}