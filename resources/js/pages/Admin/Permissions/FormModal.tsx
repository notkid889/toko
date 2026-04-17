import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/ui/input-errors';
import { PermissionModel } from '@/types';
import { FormEvent, useEffect } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    permission?: PermissionModel | null;
};

export default function FormModal({ open, onClose, permission }: Props) {
    const isEditing = !!permission;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        group: '',
    });

    useEffect(() => {
        if (permission) {
            setData({
                name: permission.name || '',
                group: permission.group || '',
            });
        } else {
            reset();
        }
        clearErrors();
    }, [permission, open]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/permissions/${permission!.id}`, {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        } else {
            post('/admin/permissions', {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Permission' : 'Create Permission'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update permission details.' : 'Create a new permission.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="perm-name">Permission Name</Label>
                        <Input
                            id="perm-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. users.create"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="perm-group">Group</Label>
                        <Input
                            id="perm-group"
                            value={data.group}
                            onChange={(e) => setData('group', e.target.value)}
                            placeholder="e.g. users"
                        />
                        <InputError message={errors.group} />
                        <p className="text-xs text-muted-foreground">
                            Group permissions together for easier management in role assignments.
                        </p>
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
