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
import { UserModel } from '@/types';
import { useState } from 'react';
import { Edit, Plus, Trash2, User } from 'lucide-react';
import FormModal from './FormModal';
import { useConfirm } from '@/components/confirm-provider';

type Props = {
    users: UserModel[];
    roles: { id: number; name: string }[];
    editUser?: UserModel | null;
};

export default function Index({ users, roles, editUser }: Props) {
    return (
        <AppLayout>
            <Head title="User Management" />
            <UserContent users={users} roles={roles} editUser={editUser} />
        </AppLayout>
    );
}

function UserContent({ users, roles, editUser }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { confirm } = useConfirm();
    const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);

    function openCreate() {
        setSelectedUser(null);
        setModalOpen(true);
    }

    function openEdit(user: UserModel) {
        setSelectedUser(user);
        setModalOpen(true);
    }

    async function handleDelete(user: UserModel) {
        const isConfirmed = await confirm({
            title: "Delete User?",
            description: `This will permanently remove the user "${user.name}" and their data.`,
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!isConfirmed) return;
        router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
    }

    function closeModal() {
        setSelectedUser(null);
        setModalOpen(false);
    }

    useState(() => {
        if (editUser) {
            setSelectedUser(editUser);
            setModalOpen(true);
        }
    });

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage user accounts and their role assignments.
                        </p>
                    </div>
                    <Button onClick={openCreate} size="sm">
                        <Plus className="mr-1 size-4" />
                        Add User
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-sidebar">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No users yet. Click "Add User" to create one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <User className="size-4" />
                                            </div>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs rounded bg-muted px-1.5 py-0.5">{user.username}</code>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.email || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-xs">
                                                        {role.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No roles</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon-xs" onClick={() => openEdit(user)}>
                                                <Edit className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => handleDelete(user)}>
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
                user={selectedUser}
                roles={roles}
            />
        </>
    );
}
