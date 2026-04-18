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

// Category & Product types
export interface CategoryModel {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    products_count?: number;
    created_at: string;
    updated_at: string;
}

export interface ProductModel {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    price: number;
    stock: number;
    unit: string;
    image: string | null;
    image_url: string;
    is_active: boolean;
    category?: CategoryModel;
    created_at: string;
    updated_at: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

// Purchase & Sale types
export interface PurchaseModel {
    id: number;
    invoice_number: string;
    supplier: string | null;
    notes: string | null;
    total: number;
    date: string;
    items_count?: number;
    items?: PurchaseItemModel[];
    created_at: string;
    updated_at: string;
}

export interface PurchaseItemModel {
    id: number;
    purchase_id: number;
    product_id: number;
    quantity: number;
    cost: number;
    subtotal: number;
    product?: ProductModel;
}

export interface SaleModel {
    id: number;
    invoice_number: string;
    customer: string | null;
    notes: string | null;
    total: number;
    date: string;
    items_count?: number;
    items?: SaleItemModel[];
    created_at: string;
    updated_at: string;
}

export interface SaleItemModel {
    id: number;
    sale_id: number;
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    product?: ProductModel;
}

export interface ProductOption {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    unit: string;
}
