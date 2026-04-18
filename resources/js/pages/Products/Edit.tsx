import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CategoryCombobox } from '@/components/ui/category-combobox';
import InputError from '@/components/ui/input-errors';
import { ProductModel } from '@/types';
import { ImagePlus, Package, DollarSign } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import axios from 'axios';

type Props = {
    product: ProductModel;
    categories: { id: number; name: string }[];
};

export default function Edit({ product, categories: initialCategories }: Props) {
    const [categories, setCategories] = useState(initialCategories);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        name: string;
        sku: string;
        category_id: string;
        description: string;
        unit: string;
        is_active: boolean;
        image: File | null;
    }>({
        _method: 'PUT',
        name: product.name,
        sku: product.sku,
        category_id: String(product.category_id),
        description: product.description || '',
        unit: product.unit,
        is_active: product.is_active,
        image: null,
    });

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('image', file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }

    async function handleCreateCategory(name: string) {
        try {
            const response = await axios.post('/categories/inline', { name }, {
                withCredentials: true,
                withXSRFToken: true,
            });
            const newCat = response.data;
            setCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
            return newCat;
        } catch {
            return null;
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(`/products/${product.id}`, {
            forceFormData: true,
        });
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const categoryOptions = categories.map((cat) => ({
        value: String(cat.id),
        label: cat.name,
    }));

    const currentImage = preview || product.image_url;

    return (
        <AppLayout>
            <Head title="Edit Product" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground text-sm">
                        Update the details of "{product.name}".
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Read-only Stock & Buy Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
                                        <Package className="size-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Current Stock</p>
                                        <p className="text-lg font-semibold tabular-nums">
                                            <span className={product.stock <= 10 ? 'text-destructive' : ''}>
                                                {product.stock}
                                            </span>
                                            <span className="ml-1 text-xs font-normal text-muted-foreground">{product.unit}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
                                        <DollarSign className="size-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Buy Price</p>
                                        <p className="text-lg font-semibold tabular-nums">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Mineral Water 600ml"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        placeholder="e.g. BEV-001"
                                    />
                                    <InputError message={errors.sku} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <CategoryCombobox
                                    id="category_id"
                                    options={categoryOptions}
                                    value={data.category_id}
                                    onChange={(value) => setData('category_id', value)}
                                    onCreateNew={handleCreateCategory}
                                    placeholder="Search or create category..."
                                />
                                <InputError message={errors.category_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Product description..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Input
                                    id="unit"
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    placeholder="pcs"
                                    className="max-w-[200px]"
                                />
                                <InputError message={errors.unit} />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label>Product Image</Label>
                                <div className="flex items-start gap-4">
                                    <img
                                        src={currentImage}
                                        alt={product.name}
                                        className="h-24 w-24 rounded-lg object-cover border"
                                    />
                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {product.image ? 'Replace Image' : 'Choose Image'}
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG, or WebP. Max 2MB.
                                        </p>
                                        {preview && (
                                            <p className="text-xs text-primary">New image selected</p>
                                        )}
                                    </div>
                                </div>
                                <InputError message={errors.image} />
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Product will be visible in the store when active.
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Update Product'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/products')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
