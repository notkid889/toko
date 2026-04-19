import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-errors';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/categories');
    }

    return (
        <AppLayout>
            <Head title="Tambah Kategori" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tambah Kategori</h1>
                    <p className="text-muted-foreground text-sm">
                        Tambahkan kategori produk baru ke toko Anda.
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Detail Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="cth. Minuman"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi singkat kategori ini..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/categories')}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
