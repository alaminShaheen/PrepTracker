import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

type DashboardLayoutProps = {
    children: ReactNode;
}

const DashboardLayout = (props: DashboardLayoutProps) => {
    const { children } = props;

    return (
        <div className="flex flex-1 h-[calc(100vh-20rem)]">
            <Sidebar />
            <div className="flex justify-center w-full h-full overflow-y-auto py-10">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
