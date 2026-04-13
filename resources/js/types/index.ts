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
