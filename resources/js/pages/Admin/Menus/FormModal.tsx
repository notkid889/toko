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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/ui/input-errors';
import { MenuModel } from '@/types';
import { FormEvent, useEffect } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    menu?: MenuModel | null;
    parentMenus: { id: number; name: string }[];
};

export default function FormModal({ open, onClose, menu, parentMenus }: Props) {
    const isEditing = !!menu;

    const { data, setData, post, put, transform, processing, errors, reset, clearErrors } = useForm({
        name: '',
        route: '',
        icon: '',
        order: 0,
        permission_key: '',
        parent_id: '' as string,
    });

    useEffect(() => {
        if (menu) {
            setData({
                name: menu.name || '',
                route: menu.route || '',
                icon: menu.icon || '',
                order: menu.order || 0,
                permission_key: menu.permission_key || '',
                parent_id: menu.parent_id ? String(menu.parent_id) : '',
            });
        } else {
            reset();
        }
        clearErrors();
    }, [menu, open]);

    transform((data) => ({
        ...data,
        parent_id: data.parent_id ? Number(data.parent_id) : null,
    }));

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/menus/${menu!.id}`, {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        } else {
            post('/admin/menus', {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Menu' : 'Create Menu'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the menu item details.' : 'Add a new menu item to the sidebar navigation.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="menu-name">Name</Label>
                        <Input
                            id="menu-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Dashboard"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="menu-route">Route</Label>
                            <Input
                                id="menu-route"
                                value={data.route}
                                onChange={(e) => setData('route', e.target.value)}
                                placeholder="e.g. /admin/users"
                            />
                            <InputError message={errors.route} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="menu-icon">Icon</Label>
                            <Input
                                id="menu-icon"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                placeholder="e.g. Users"
                            />
                            <InputError message={errors.icon} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="menu-order">Order</Label>
                            <Input
                                id="menu-order"
                                type="number"
                                value={data.order}
                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                            />
                            <InputError message={errors.order} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="menu-permission-key">Permission Key</Label>
                            <Input
                                id="menu-permission-key"
                                value={data.permission_key}
                                onChange={(e) => setData('permission_key', e.target.value)}
                                placeholder="e.g. users"
                            />
                            <InputError message={errors.permission_key} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="menu-parent">Parent Menu</Label>
                        <Select
                            value={data.parent_id ? String(data.parent_id) : 'none'}
                            onValueChange={(v) => setData('parent_id', v === 'none' ? '' : v)}
                        >
                            <SelectTrigger id="menu-parent">
                                <SelectValue placeholder="No parent (root menu)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No parent (root menu)</SelectItem>
                                {parentMenus.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.parent_id} />
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
