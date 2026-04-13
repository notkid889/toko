
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarGroup,
    SidebarMenuItem,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { LayoutDashboard } from 'lucide-react';
import NavMenu from './nav-menu';
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
      <SidebarContent>
        <NavMenu/>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}