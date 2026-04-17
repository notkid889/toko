import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/ui/input-errors';
import { RoleModel, UserModel } from '@/types';
import { FormEvent, useEffect } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    user?: UserModel | null;
    roles: { id: number; name: string }[];
};

export default function FormModal({ open, onClose, user, roles }: Props) {
    const isEditing = !!user;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        roles: [] as number[],
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                password: '',
                roles: user.roles?.map((r) => r.id) || [],
            });
        } else {
            reset();
        }
        clearErrors();
    }, [user, open]);

    function toggleRole(roleId: number) {
        setData(
            'roles',
            data.roles.includes(roleId)
                ? data.roles.filter((id) => id !== roleId)
                : [...data.roles, roleId],
        );
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/users/${user!.id}`, {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        } else {
            post('/admin/users', {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit User' : 'Create User'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update user information and roles.' : 'Create a new user account.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-name">Full Name</Label>
                        <Input
                            id="user-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-username">Username</Label>
                            <Input
                                id="user-username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="e.g. johndoe"
                            />
                            <InputError message={errors.username} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="optional"
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user-password">
                            Password {isEditing && <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>}
                        </Label>
                        <Input
                            id="user-password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={isEditing ? '••••••••' : 'Enter password'}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Label>Roles</Label>
                        <InputError message={errors.roles} />
                        <div className="rounded-lg border p-3 space-y-2">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.id)}
                                        onCheckedChange={() => toggleRole(role.id)}
                                    />
                                    <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer font-normal">
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                            {roles.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center">
                                    No roles available. Create some first.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
