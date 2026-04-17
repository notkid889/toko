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
import { PermissionModel, RoleModel } from '@/types';
import { useState } from 'react';
import { Edit, Plus, Trash2, Shield, Users } from 'lucide-react';
import FormModal from './FormModal';
import { useConfirm } from '@/components/confirm-provider';
import { Checkbox } from '@/components/ui/checkbox';

type Props = {
    roles: RoleModel[];
    permissions: PermissionModel[];
    editRole?: RoleModel | null;
};
export default function Index({ roles, permissions, editRole }: Props) {
    return (
        <AppLayout>
            <Head title="User Management" />
            <UserContent roles={roles} permissions={permissions} editRole={editRole} />
        </AppLayout>
    );
}
function UserContent({ roles, permissions, editRole }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { confirm } = useConfirm();
    const [selectedRole, setSelectedRole] = useState<RoleModel | null>(null);

    function openCreate() {
        setSelectedRole(null);
        setModalOpen(true);
    }

    function openEdit(role: RoleModel) {
        setSelectedRole(role);
        setModalOpen(true);
    }

    async function handleDelete(role: RoleModel) {
        const isConfirmed = await confirm({
            title: "Delete Role?",
            description: `This will permanently remove the role "${role.name}".`,
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!isConfirmed) return;
        router.delete(`/admin/roles/${role.id}`, { preserveScroll: true });
    }

    function closeModal() {
        setSelectedRole(null);
        setModalOpen(false);
    }

    useState(() => {
        if (editRole) {
            setSelectedRole(editRole);
            setModalOpen(true);
        }
    });

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage roles and their associated permissions.
                        </p>
                    </div>
                    <Button onClick={openCreate} size="sm">
                        <Plus className="mr-1 size-4" />
                        Add Role
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-sidebar">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Shield className="size-3.5" />
                                        Permissions
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Users className="size-3.5" />
                                        Users
                                    </div>
                                </TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No roles yet. Click "Add Role" to create one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Shield className="size-4" />
                                            </div>
                                            <span className="font-medium">{role.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{role.permissions_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{role.users_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(role.created_at).toLocaleDateString('id-ID')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon-xs" onClick={() => openEdit(role)}>
                                                <Edit className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => handleDelete(role)}>
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <FormModal
                open={modalOpen}
                onClose={closeModal}
                role={selectedRole}
                permissions={permissions}
            />
        </>
    );
}
