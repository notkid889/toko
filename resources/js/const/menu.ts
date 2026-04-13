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
                route: '/users',
                icon: 'Users',
                order: 0,
                permission_key: 'users',
                parent_id: 1
            },
            {
                id: 4,
                name: 'Role Management',
                route: '/roles',
                icon: 'Shield',
                order: 1,
                permission_key: 'roles',
                parent_id: 1
            },
            {
                id: 5,
                name: 'Menu Management',
                route: '/menus',
                icon: 'Menu',
                order: 2,
                permission_key: 'menu-items',
                parent_id: 1
            },
        ]
    }
];
export default MenuLists