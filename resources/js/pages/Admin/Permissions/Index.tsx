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
import { PermissionModel } from '@/types';
import { useState, useMemo } from 'react';
import { Edit, Plus, Trash2, KeyRound } from 'lucide-react';
import FormModal from './FormModal';
import { useConfirm } from '@/components/confirm-provider';

type Props = {
    permissions: PermissionModel[];
    editPermission?: PermissionModel | null;
};
export default function Index({ permissions, editPermission }: Props) {
    return (
        <AppLayout>
            <Head title="User Management" />
            <UserContent permissions={permissions} editPermission={editPermission} />
        </AppLayout>
    );
}

function UserContent({ permissions, editPermission }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { confirm } = useConfirm();
    const [selectedPermission, setSelectedPermission] = useState<PermissionModel | null>(null);

    // Group permissions by group field
    const grouped = useMemo(() => {
        const map = new Map<string, PermissionModel[]>();
        permissions.forEach((p) => {
            const group = p.group || 'Ungrouped';
            if (!map.has(group)) map.set(group, []);
            map.get(group)!.push(p);
        });
        return map;
    }, [permissions]);

    function openCreate() {
        setSelectedPermission(null);
        setModalOpen(true);
    }

    function openEdit(permission: PermissionModel) {
        setSelectedPermission(permission);
        setModalOpen(true);
    }

    async function handleDelete(permission: PermissionModel) {
        const isConfirmed = await confirm({
            title: "Delete Menu?",
            description: `Delete permission "${permission.name}"? It will be removed from all roles.`,
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!isConfirmed) return;
        router.delete(`/admin/permissions/${permission.id}`, { preserveScroll: true });
    }

    function closeModal() {
        setSelectedPermission(null);
        setModalOpen(false);
    }

    useState(() => {
        if (editPermission) {
            setSelectedPermission(editPermission);
            setModalOpen(true);
        }
    });

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Permission Management</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage granular permissions for your application.
                        </p>
                    </div>
                    <Button onClick={openCreate} size="sm">
                        <Plus className="mr-1 size-4" />
                        Add Permission
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-sidebar">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permission</TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead className="text-center">Used in Roles</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No permissions yet. Click "Add Permission" to create one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {Array.from(grouped.entries()).map(([group, perms]) => (
                                perms.map((perm, idx) => (
                                    <TableRow key={perm.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                    <KeyRound className="size-3.5" />
                                                </div>
                                                <code className="text-sm">{perm.name}</code>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {idx === 0 ? (
                                                <Badge variant="outline" className="capitalize">{group}</Badge>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{perm.roles_count ?? 0}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(perm.created_at).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon-xs" onClick={() => openEdit(perm)}>
                                                    <Edit className="size-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => handleDelete(perm)}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <FormModal
                open={modalOpen}
                onClose={closeModal}
                permission={selectedPermission}
            />
        </>
    );
}
