"use client";

import React from "react";

import RegistrationForm from "@/components/RegistrationForm";

const Register = () => {
    return (
        <div className="flex w-full justify-center items-center flex-1 flex-col gap-4">
            <h1 className="text-2xl">Register</h1>
            <span>Commit. Track. Succeed. ✅📖</span>
            <RegistrationForm />
        </div>
    );
};

export default Register;
