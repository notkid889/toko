<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $permissionId = $this->route('permission')?->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('permissions')->ignore($permissionId)],
            'guard_name' => ['string', 'max:255'],
            'group' => ['nullable', 'string', 'max:255'],
        ];
    }
}
