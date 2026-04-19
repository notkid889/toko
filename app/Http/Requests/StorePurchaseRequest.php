<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'date' => ['required', 'date', 'date_format:Y-m-d'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.cost' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Minimal satu item diperlukan.',
            'items.min' => 'Minimal satu item diperlukan.',
            'items.*.product_id.required' => 'Produk harus dipilih.',
            'items.*.product_id.exists' => 'Produk tidak ditemukan.',
            'items.*.product_id.distinct' => 'Produk tidak boleh dipilih lebih dari sekali.',
            'items.*.quantity.required' => 'Jumlah harus diisi.',
            'items.*.quantity.min' => 'Jumlah minimal 1.',
            'items.*.cost.required' => 'Harga harus diisi.',
            'items.*.cost.min' => 'Harga tidak boleh negatif.',
            'date.required' => 'Tanggal harus diisi.',
            'date.date_format' => 'Format tanggal tidak valid.',
        ];
    }
}
