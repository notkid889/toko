import { ChartBar, DollarSign, KeyRound, LayoutDashboard, Menu, Package, Shield, ShoppingBag, ShoppingCart, Tags, Users } from "lucide-react";
import { ReactNode } from "react";

const IconMap: Record<string, ReactNode> = {
    LayoutDashboard: (
        <LayoutDashboard />
    ),
    Users: (
        <Users />
    ),
    Shield: (
        <Shield />
    ),
    Menu: (
        <Menu />
    ),
    Package: (
        <Package />
    ),
    KeyRound: (
        <KeyRound />
    ),
    ShoppingBag: (
        <ShoppingBag />
    ),
    Tags: (
        <Tags />
    ),
    ShoppingCart: (
        <ShoppingCart />
    ),
    DollarSign: (
        <DollarSign />
    ),
    ChartBar: (
        <ChartBar />
    ),
};
function getIcon(iconName?: string): ReactNode {
    if (!iconName) return null;
    return IconMap[iconName] || (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );
}
export default getIcon
