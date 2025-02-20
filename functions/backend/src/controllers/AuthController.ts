import { NextFunction, Request, Response } from "express";

import { AuthService } from "@/services/AuthService";
import { RegisterUserDto } from "@/models/dtos/RegisterUserDto";
import { LoginRequestDto } from "@/models/dtos/LoginRequestDto";
import { handleFormValidationErrors } from "@/utils/throwValidationErrors";

async function loginHandler(request: Request<{}, {}, LoginRequestDto>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const loginResponse = await AuthService.login(request.body, response);
        response.status(200).json(loginResponse);
    } catch (error) {
        next(error);
    }
}

async function registerHandler(request: Request<{}, {}, RegisterUserDto>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        await AuthService.register(request.body);
        response.sendStatus(200);
        return;
    } catch (error: any) {
        next(error);
    }
}

async function registerOAuthHandler(request: Request, response: Response, next: NextFunction) {
    try {
        const user = await AuthService.registerOAuthUser(request.userInfo);
        response.status(200).json(user);
        return;
    } catch (error: any) {
        next(error);
    }
}

async function registerPasswordReset(request: Request<{}, {}, RegisterUserDto>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        await AuthService.resetPassword(request.body);
        response.sendStatus(200);
        return;
    } catch (error: any) {
        next(error);
    }
}

async function unsubscribeEmailSubscription(request: Request<{}, {}, {}, {email: string, redirect?: string}>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const decodedEmail = decodeURIComponent(request.query.email);
        const result = await AuthService.unsubscribeEmail(decodedEmail);

        if (Boolean(request.query.redirect)) {
            response.redirect(`/api/auth/unsubscribe-success?email=${encodeURIComponent(decodedEmail)}`);
        } else {
            response.status(200).json(result);
        }
        return;
    } catch (error) {
        next(error);
    }
}

async function subscribeEmailSubscription(request: Request<{}, {}, {}, {email: string}>, response: Response, next: NextFunction) {
    try {
        handleFormValidationErrors(request);
        const decodedEmail = decodeURIComponent(request.query.email);
        const result = await AuthService.subscribeEmail(decodedEmail);
        response.status(200).json(result);
        return;
    } catch (error) {
        next(error);
    }
}

async function unsubscribeSuccess(request: Request<{}, {}, {}, { email: string }>, response: Response, next: NextFunction) {
    try {
        response.send(`<h1>Successfully unsubscribed: ${request.query.email}</h1>`);
    } catch (error) {
        next(error);
    }
}

export const AuthController = {
    loginHandler,
    registerHandler,
    registerPasswordReset,
    registerOAuthHandler,
    unsubscribeEmailSubscription,
    unsubscribeSuccess,
    subscribeEmailSubscription
};