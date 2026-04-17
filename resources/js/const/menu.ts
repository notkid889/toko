import { MenuGroup } from "@/types";

const MenuLists:MenuGroup[] = [
    {
        id: 0,
        name: 'Platform',
        order: 0,
        child: [
            {
                id: 2,
                name: 'Dashboard',
                route: '/',
                icon: 'LayoutDashboard',
                order: 0,
                permission_key: 'dashboard',
                parent_id: 0
            },
        ]
    },
    {
        id: 1,
        name: 'Management',
        order: 1,
        child: [
            {
                id: 3,
                name: 'User Management',
                route: '/admin/users',
                icon: 'Users',
                order: 0,
                permission_key: 'users',
                parent_id: 1
            },
            {
                id: 4,
                name: 'Role Management',
                route: '/admin/roles',
                icon: 'Shield',
                order: 1,
                permission_key: 'roles',
                parent_id: 1
            },
            {
                id: 5,
                name: 'Menu Management',
                route: '/admin/menus',
                icon: 'Menu',
                order: 2,
                permission_key: 'menu-items',
                parent_id: 1
            },
            {
                id: 6,
                name: 'Permission Management',
                route: '/admin/permissions',
                icon: 'KeyRound',
                order: 3,
                permission_key: 'permissions',
                parent_id: 1
            },
        ]
    }
];
export default MenuLists