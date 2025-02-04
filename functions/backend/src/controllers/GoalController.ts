import { NextFunction, Request, Response } from "express";

import { AuthService } from "@/services/AuthService";
import { RegisterUserDto } from "@/models/dtos/RegisterUserDto";
import { LoginRequestDto } from "@/models/dtos/LoginRequestDto";
import { handleFormValidationErrors } from "@/utils/throwValidationErrors";
import { CreateGoalRequestDto } from "@/models/dtos/CreateGoalRequestDto";
import { UpdateGoalRequestDto } from "@/models/dtos/UpdateGoalRequestDto";
import { GoalService } from "@/services/GoalService";

async function createGoalHandler(request: Request<{}, {}, CreateGoalRequestDto>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const createdGoal = await GoalService.createGoal(request.body, request.userInfo.uid);
        response.status(200).json(createdGoal);
    } catch (error) {
        next(error);
    }
}

async function updateGoalHandler(request: Request<{id: string}, {}, UpdateGoalRequestDto>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const updatedGoal = await GoalService.updateGoal(request.body, request.params.id, request.userInfo.uid);
        response.status(200).json(updatedGoal);
        return;
    } catch (error: any) {
        next(error);
    }
}

async function deleteGoalHandler(request: Request<{id: string}>, response: Response, next: NextFunction) {
    try {
        const status = await GoalService.deleteGoal(request.params.id, request.userInfo.uid);
        response.status(200).json(status ? request.params.id : "");
        return;
    } catch (error: any) {
        next(error);
    }
}

async function getGoalHandler(request: Request<{id: string}, {}>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const goal = await GoalService.getGoal(request.params.id, request.userInfo.uid);
        response.sendStatus(200);
        return;
    } catch (error: any) {
        next(error);
    }
}

async function getActiveGoals(request: Request, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const goal = await GoalService.getActiveGoals(request.userInfo.uid);
        response.status(200).json(goal);
        return;
    } catch (error: any) {
        next(error);
    }
}

async function getTomorrowGoals(request: Request, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const goal = await GoalService.getTomorrowGoals(request.userInfo.uid);
        response.status(200).json(goal);
        return;
    } catch (error: any) {
        next(error);
    }
}

async function getNext7DayGoals(request: Request, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const goal = await GoalService.next7DayGoals(request.userInfo.uid);
        response.status(200).json(goal);
        return;
    } catch (error: any) {
        next(error);
    }
}

export const GoalController = {
    getGoalHandler,
    deleteGoalHandler,
    updateGoalHandler,
    createGoalHandler,
    getActiveGoals,
    getTomorrowGoals,
    getNext7DayGoals,
};