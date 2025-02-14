import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal,
    DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, Calendar1, CalendarDays, Settings2 } from "lucide-react";
import { ROUTES } from "@/constants/Routes";
import Link from "next/link";

const OptionsDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="flex lg:hidden">
                <Button variant="ghost" size="icon" title="Open">
                    <Settings2 />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                    <Link href={ROUTES.DASHBOARD.ROOT} className="flex gap-2 items-center">
                        <Calendar1 size={16} /> Today
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href={ROUTES.DASHBOARD.TOMORROW} className="flex gap-2 items-center">
                        <Calendar size={16} /> Tomorrow
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href={ROUTES.DASHBOARD.NEXT_7_DAYS} className="flex gap-2 items-center">
                        <CalendarDays size={16} /> Next 7 Days
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default OptionsDropdown;
