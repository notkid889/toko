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
import { PermissionModel, RoleModel } from '@/types';
import { FormEvent, useEffect, useMemo } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    role?: RoleModel | null;
    permissions: PermissionModel[];
};

export default function FormModal({ open, onClose, role, permissions }: Props) {
    const isEditing = !!role;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        permissions: [] as number[],
    });

    useEffect(() => {
        if (role) {
            setData({
                name: role.name || '',
                permissions: role.permissions?.map((p) => p.id) || [],
            });
            console.log(role)
        } else {
            reset();
        }
        clearErrors();
    }, [role, open]);

    // Group permissions by their group field
    const grouped = useMemo(() => {
        const map = new Map<string, PermissionModel[]>();
        permissions.forEach((p) => {
            const group = p.group || 'Other';
            if (!map.has(group)) map.set(group, []);
            map.get(group)!.push(p);
        });
        return map;
    }, [permissions]);

    function togglePermission(permId: number) {
        setData(
            'permissions',
            data.permissions.includes(permId)
                ? data.permissions.filter((id) => id !== permId)
                : [...data.permissions, permId],
        );
    }

    function toggleGroup(groupPerms: PermissionModel[]) {
        const groupIds = groupPerms.map((p) => p.id);
        const allSelected = groupIds.every((id) => data.permissions.includes(id));
        if (allSelected) {
            setData('permissions', data.permissions.filter((id) => !groupIds.includes(id)));
        } else {
            setData('permissions', [...new Set([...data.permissions, ...groupIds])]);
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/roles/${role!.id}`, {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        } else {
            post('/admin/roles', {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Role' : 'Create Role'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update role name and permissions.' : 'Create a new role and assign permissions.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                            id="role-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Editor"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-3">
                        <Label>Permissions</Label>
                        <InputError message={errors.permissions} />
                        <div className="space-y-4 rounded-lg border p-4 max-h-[40vh] overflow-y-auto">
                            {Array.from(grouped.entries()).map(([group, perms]) => {
                                const allSelected = perms.every((p) => { return data.permissions.includes(p.id) });
                                const someSelected = perms.some((p) => data.permissions.includes(p.id));
                                return (
                                    <div key={group} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`group-${group}`}
                                                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                                onCheckedChange={() => toggleGroup(perms)}
                                            />
                                            <Label
                                                htmlFor={`group-${group}`}
                                                className="text-sm font-semibold capitalize cursor-pointer"
                                            >
                                                {group}
                                            </Label>
                                        </div>
                                        <div className="ml-6 grid grid-cols-2 gap-2">
                                            {perms.map((perm) => (
                                                <div key={perm.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`perm-${perm.id}`}
                                                        checked={data.permissions.includes(perm.id)}
                                                        onCheckedChange={() => togglePermission(perm.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`perm-${perm.id}`}
                                                        className="text-sm cursor-pointer font-normal"
                                                    >
                                                        {perm.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {grouped.size === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                    No permissions available. Create some first.
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
