export type * from './auth';

export interface MenuGroup {
    id: number;
    name: string;
    order: number;
    child: Menu[];
}
export interface Menu {
    id: number;
    name: string;
    route: string;
    icon: string;
    order: number;
    permission_key: string;
    parent_id: number;
}

// RBAC Types
export interface MenuModel {
    id: number;
    name: string;
    route: string | null;
    icon: string | null;
    order: number;
    permission_key: string | null;
    parent_id: number | null;
    parent?: MenuModel | null;
    children?: MenuModel[];
    created_at: string;
    updated_at: string;
}

export interface RoleModel {
    id: number;
    name: string;
    guard_name: string;
    permissions?: PermissionModel[];
    permissions_count?: number;
    users_count?: number;
    created_at: string;
    updated_at: string;
}

export interface PermissionModel {
    id: number;
    name: string;
    guard_name: string;
    group: string | null;
    roles_count?: number;
    created_at: string;
    updated_at: string;
}

export interface UserModel {
    id: number;
    name: string;
    username: string;
    email: string | null;
    roles?: RoleModel[];
    created_at: string;
    updated_at: string;
}

export interface FlashMessages {
    success?: string;
    error?: string;
}
