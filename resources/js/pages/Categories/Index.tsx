import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CategoryModel } from '@/types';
import { Edit, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/confirm-provider';
import { useFlash } from '@/hooks/use-flash';

type Props = {
    categories: CategoryModel[];
};

export default function Index({ categories }: Props) {
    return (
        <AppLayout>
            <Head title="Kategori" />
            <CategoryContent categories={categories} />
        </AppLayout>
    );
}

function CategoryContent({ categories }: Props) {
    const { confirm } = useConfirm();
    useFlash();

    async function handleDelete(category: CategoryModel) {
        const isConfirmed = await confirm({
            title: 'Hapus Kategori?',
            description: `Kategori "${category.name}" dan semua produknya akan dihapus secara permanen.`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
        });
        if (!isConfirmed) return;
        router.delete(`/categories/${category.id}`, { preserveScroll: true });
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
                    <p className="text-muted-foreground text-sm">
                        Kelola kategori produk untuk toko Anda.
                    </p>
                </div>
                <Button size="default" onClick={() => router.visit('/categories/create')} >
                    <Plus className="mr-1 size-4" />
                    Tambah Kategori
                </Button>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-sidebar">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead className="text-center">Produk</TableHead>
                            <TableHead>Dibuat</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                    Belum ada kategori. Klik "Tambah Kategori" untuk membuat.
                                </TableCell>
                            </TableRow>
                        )}
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <FolderOpen className="size-4" />
                                        </div>
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                                    {category.description || '—'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <code className="text-xs rounded bg-muted px-1.5 py-0.5">
                                        {category.products_count ?? 0}
                                    </code>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(category.created_at).toLocaleDateString('id-ID')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => router.visit(`/categories/${category.id}/edit`)}
                                        >
                                            <Edit className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            className="text-destructive"
                                            onClick={() => handleDelete(category)}
                                        >
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
    );
}
