"use client";

import React from "react";
import LoginForm from "@/components/LoginForm";

const Login = () => {
    return (
        <div className="flex w-full justify-center items-center flex-1 flex-col gap-4">
            <h1 className="text-2xl">Login</h1>
            <span>Stay accountable, Stay ahead 🚀📚</span>
            <LoginForm />
        </div>
    );
};

export default Login;
