import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { MenuModel } from '@/types';
import React, { useState } from 'react';
import { Edit, Plus, Trash2, GripVertical } from 'lucide-react';
import FormModal from './FormModal';
import getIcon from '@/components/icon-map';
import { useConfirm } from '@/components/confirm-provider';

type Props = {
    menusData: MenuModel[];
    parentMenus: { id: number; name: string }[];
    editMenu?: MenuModel | null;
};
export default function Index({ menusData, parentMenus, editMenu }: Props) {
    return (
        <AppLayout>
            <Head title="User Management" />
            <UserContent menusData={menusData} parentMenus={parentMenus} editMenu={editMenu} />
        </AppLayout>
    );
}
function UserContent({ menusData, parentMenus, editMenu }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { confirm } = useConfirm();
    const [selectedMenu, setSelectedMenu] = useState<MenuModel | null>(null);

    // Group menus: roots (no parent_id) → group headers, others → children
    const rootMenus = menusData.filter((m) => !m.parent_id);
    const childMenus = menusData.filter((m) => m.parent_id);

    function openCreate() {
        setSelectedMenu(null);
        setModalOpen(true);
    }

    function openEdit(menu: MenuModel) {
        setSelectedMenu(menu);
        setModalOpen(true);
    }

    async function handleDelete(menu: MenuModel) {
        const isConfirmed = await confirm({
            title: "Delete Menu?",
            description: `Delete "${menu.name}"? Children will become root items.`,
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!isConfirmed) return;
        router.delete(`/admin/menus/${menu.id}`, { preserveScroll: true });
    }

    function closeModal() {
        setSelectedMenu(null);
        setModalOpen(false);
    }

    // If editMenu provided via server props (e.g. from edit route), open modal
    useState(() => {
        if (editMenu) {
            setSelectedMenu(editMenu);
            setModalOpen(true);
        }
    });

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage sidebar navigation menu items.
                        </p>
                    </div>
                    <Button onClick={openCreate} size="sm">
                        <Plus className="mr-1 size-4" />
                        Add Menu
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-sidebar shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Icon</TableHead>
                                <TableHead className="text-center">Order</TableHead>
                                <TableHead>Permission Key</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rootMenus.length === 0 && childMenus.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                        No menu items yet. Click "Add Menu" to create one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rootMenus.map((root) => (
                                <React.Fragment key={`root-${root.id}`}>
                                    <TableRow className="bg-muted/30">
                                        <TableCell>
                                            <GripVertical className="size-4 text-muted-foreground" />
                                        </TableCell>
                                        <TableCell className="font-semibold">{root.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {root.route || '—'}
                                        </TableCell>
                                        <TableCell>
                                            {root.icon ? (
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    {getIcon(root.icon)}
                                                    <span className="text-xs">{root.icon}</span>
                                                </span>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell className="text-center">{root.order}</TableCell>
                                        <TableCell>
                                            {root.permission_key ? (
                                                <Badge variant="secondary" className="text-xs">{root.permission_key}</Badge>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">Group</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon-xs" onClick={() => openEdit(root)}>
                                                    <Edit className="size-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => handleDelete(root)}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {childMenus
                                        .filter((c) => c.parent_id === root.id)
                                        .sort((a, b) => a.order - b.order)
                                        .map((child) => (
                                            <TableRow key={`child-${child.id}`}>
                                                <TableCell></TableCell>
                                                <TableCell className="pl-8">
                                                    <span className="text-muted-foreground mr-2">└</span>
                                                    {child.name}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs rounded bg-muted px-1.5 py-0.5">
                                                        {child.route || '—'}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {child.icon ? (
                                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                                            {getIcon(child.icon)}
                                                            <span className="text-xs">{child.icon}</span>
                                                        </span>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell className="text-center">{child.order}</TableCell>
                                                <TableCell>
                                                    {child.permission_key ? (
                                                        <Badge variant="secondary" className="text-xs">{child.permission_key}</Badge>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">Item</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon-xs" onClick={() => openEdit(child)}>
                                                            <Edit className="size-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => handleDelete(child)}>
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <FormModal
                open={modalOpen}
                onClose={closeModal}
                menu={selectedMenu}
                parentMenus={parentMenus}
            />
        </>
    );
}
