import { Link } from "@inertiajs/react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import MenuLists from "@/const/menu";
import { Menu, MenuGroup } from "@/types";
import getIcon from "./icon-map";
import { useCurrentUrl } from "@/hooks/use-current-url";

export default function NavMenu() {
    const menu = MenuLists;
    const { isCurrentUrl } = useCurrentUrl();
    return (
        <>
        {
            menu.map((item:MenuGroup)=> (
                <SidebarGroup className="px-2 py-0" key={item.id}>
                    <SidebarGroupLabel>{item.name}</SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                            {item.child.map((child:Menu)=> (
                                <SidebarMenuItem key={child.id}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(child.route)}
                                        tooltip={{ children: item.name }}
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
            ))
        }
        </>
    );
}
