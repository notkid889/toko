import { AppContent } from "@/components/app-content";
import { AppSidebarHeader } from "@/components/app-sidebar-header";
import { AppSidebar } from "@/components/Appsidebar";
import { ConfirmProvider } from "@/components/confirm-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactNode } from "react";

export default ({ children }: { children: ReactNode }) => (
    <ConfirmProvider>
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader />
                    {children}
                </AppContent>
            </SidebarProvider>
        </TooltipProvider>
    </ConfirmProvider>
);
