"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { Hourglass, KeySquare, LogOut, MailCheck, MailQuestion, MailX, Moon, Sun } from "lucide-react";

import { auth } from "@/firebaseConfig";
import { ROUTES } from "@/constants/Routes";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useMediaQuery } from "usehooks-ts";
import OptionsDropdown from "@/components/OptionsDropdown";
import { useUpdateEmailSubscription } from "@/hooks/mutations/useUpdateEmailSubscription";
import { toast } from "sonner";
import { toastDateFormat } from "@/lib/utils";
import { UpdateSubscriptionResponse } from "@/models/services/UpdateSubscriptionResponse";

const Navbar = () => {
    const { resolvedTheme, setTheme } = useTheme();
    const { authenticated, subscribedToEmails, user } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();
    const { handleErrors } = useErrorHandler();
    const isTabView = useMediaQuery("(min-width: 768px)");

    const { mutate } = useUpdateEmailSubscription({
        onSuccess: (response: UpdateSubscriptionResponse) => {
            toast.success(response.subscriptionStatus ? "Subscribed to email notifications successfully." : "Unsubscribed from email notifications successfully", {
                richColors: true,
                description: toastDateFormat(new Date())
            });
        }
    });


    const onThemeChange = useCallback(() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }, [resolvedTheme, setTheme]);

    const onLogout = useCallback(async () => {
        try {
            await signOut(auth);
            router.push(ROUTES.LOGIN);
        } catch (error) {
            handleErrors(error);
        }
    }, [router, handleErrors]);

    const onUpdateSubscription = useCallback(() => {
        if (user?.email) {
            mutate({ email: user.email, shouldSubscribe: !subscribedToEmails });
        }
    }, [user?.email, subscribedToEmails, mutate]);

    return (
        <nav className="p-6 flex justify-between items-center bg-background border-b-2 h-20 sticky top-0">
            <div>
                <h1 className="text-2xl font-bold md:block hidden">
                    <Link href={authenticated ? ROUTES.DASHBOARD.TODAY : ROUTES.LOGIN}
                          className="relative z-20 flex items-center text-lg font-medium">
                        <Hourglass />
                        PrepTracker
                    </Link>
                </h1>
            </div>
            <div className="flex items-center gap-x-1 md:gap-x-2">
                {
                    authenticated &&
                    <Button variant="ghost" size="icon" onClick={onUpdateSubscription}
                            title={
                                subscribedToEmails === undefined ?
                                    "Pending subscription for email notifications"
                                    : subscribedToEmails ?
                                        "Unsubscribe to email notifications"
                                        : "Subscribe to email notifications"
                            }>
                        {subscribedToEmails === undefined ?
                            <MailQuestion className="text-yellow-400" /> : subscribedToEmails ?
                                <MailX className="text-destructive" /> :
                                <MailCheck className="text-green-600" />}
                    </Button>
                }
                <Button variant="ghost" size="icon" onClick={onThemeChange}
                        title={resolvedTheme === "dark" ? "Toggle dark mode" : "Toggle light mode"}>
                    {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                </Button>
                {authenticated && <OptionsDropdown />}
                <div className="flex items-center gap-x-4">
                    {!authenticated && (
                        <Link href={pathname === ROUTES.LOGIN ? ROUTES.REGISTER : ROUTES.LOGIN}>
                            <Button variant="ghost">
                                <KeySquare />
                                {pathname === ROUTES.LOGIN ? "Register" : "Login"}
                            </Button>
                        </Link>
                    )}
                    {
                        authenticated &&
                        <Button variant={isTabView ? "destructive" : "ghost"} onClick={onLogout} title="Logout">
                            <LogOut className="text-destructive md:text-white" />
                            <span className="hidden md:inline">
                                Logout
                            </span>
                        </Button>
                    }
                </div>
            </div>

        </nav>
    );
};

export default Navbar;
