<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::with('permissions')->withCount('permissions', 'users')->get();
        $permissions = Permission::orderBy('group')->orderBy('name')->get();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        $role = Role::create($request->safe()->only('name', 'guard_name'));
        $role->permissions()->sync($request->input('permissions', []));

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role created successfully.');
    }

    public function edit(Role $role): Response
    {
        $roles = Role::withCount('permissions', 'users')->get();
        $permissions = Permission::orderBy('group')->orderBy('name')->get();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'editRole' => $role->load('permissions'),
        ]);
    }

    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        $role->update($request->safe()->only('name', 'guard_name'));
        $role->permissions()->sync($request->input('permissions', []));

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $role->permissions()->detach();
        $role->users()->detach();
        $role->delete();

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
