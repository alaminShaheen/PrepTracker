import "module-alias/register";
import cors from "cors";
import express from "express";
import * as functions from "firebase-functions";
import * as firebaseV2Functions from "firebase-functions/v2";
import router from "@/routers/index";
import logging from "@/utils/logging";
import { errorHandler } from "@/middlewares/errorHandler";
import { loggingHandler } from "@/middlewares/loggingHandler";
import { CLIENT_ORIGIN, SENDER_EMAIL, SERVER_PORT, TWILIO_SENDGRID_API_KEY } from "@/configs/config";
import sgMail from "@sendgrid/mail";
import { AuthRepository } from "@/repositories/AuthRepository";
import { User } from "@/models/User";
import { GoalService } from "@/services/GoalService";


const app = express();
app.use(cors({
    origin: CLIENT_ORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());
sgMail.setApiKey(TWILIO_SENDGRID_API_KEY);


const appRouter = router();

app.use(loggingHandler);

app.options("*", cors({
    origin: CLIENT_ORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use("/api", appRouter);


app.use(errorHandler);


app.listen(SERVER_PORT, () => {
    logging.log(`Server running on port ${SERVER_PORT}`);
});

exports.app = functions.https.onRequest(app);

exports.scheduler = firebaseV2Functions.scheduler.onSchedule("every day 00:00", async (event) => {
    try {
        const allUsers = await AuthRepository.getAllUsers();
        const userData: User[] = [];

        allUsers.forEach((user) => {
            const data = user.data();
            userData.push(data);
        });

        for (const userDatum of userData) {
            await GoalService.cleanExpiredGoals(userDatum.id);
            if (userDatum.subscribed) {
                const result = await GoalService.getUserEmailGoals(userDatum);
                if (result) {
                    const email = await GoalService.createEmailTemplate(userDatum, result.activeTodayGoals, result.activeWeeklyGoals, result.activeOneTimeGoals);
                    await sgMail.send({
                        to: userDatum.email,
                        from: SENDER_EMAIL,
                        subject: "Your Tasks for Today",
                        html: email
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error sending emails:", error);
    }
    return;
});