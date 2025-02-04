import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

type DashboardLayoutProps = {
    children: ReactNode;
}

const DashboardLayout = (props: DashboardLayoutProps) => {
    const { children } = props;

    return (
        <div className="flex flex-1">
            <Sidebar />
            <div className="flex justify-center flex-1 max-h-screen overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
