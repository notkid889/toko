import { Link, usePage } from "@inertiajs/react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import getIcon from "./icon-map";

interface MenuItem {
    id: number;
    name: string;
    route: string;
    icon: string;
    order: number;
    permission_key: string | null;
}

interface MenuGroup {
    id: number;
    name: string;
    order: number;
    children: MenuItem[];
}

export default function NavMenu() {
    const page = usePage<{ menus: MenuGroup[] }>();
    const menus = page.props.menus;
    const url = page.url;

    const isActive = (route: string) => {
        if (!route) return false;
        if (route === '/') return url === '/';
        return url === route || url.startsWith(`${route}`);
    };

    return (
        <>
            {(menus ?? []).map((group) => (
                <SidebarGroup className="px-2 py-0" key={group.id}>
                    <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {group.children.map((child) => (
                            <SidebarMenuItem key={child.id}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive(child.route)}
                                    tooltip={{ children: child.name }}
                                >
                                    <Link href={child.route} prefetch>
                                        {getIcon(child.icon)}
                                        <span>{child.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
