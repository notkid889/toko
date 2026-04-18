<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create permissions grouped by resource
        $permissionGroups = [
            'dashboard' => ['dashboard.view'],
            'users' => ['users.view', 'users.create', 'users.edit', 'users.delete'],
            'roles' => ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
            'menus' => ['menus.view', 'menus.create', 'menus.edit', 'menus.delete'],
            'permissions' => ['permissions.view', 'permissions.create', 'permissions.edit', 'permissions.delete'],
            'stock' => ['stock.view', 'stock.create', 'stock.edit', 'stock.delete'],
            'categories' => ['categories.view', 'categories.create', 'categories.edit', 'categories.delete'],
            'products' => ['products.view', 'products.create', 'products.edit', 'products.delete'],
            'purchases' => ['purchases.view', 'purchases.create', 'purchases.delete'],
            'sales' => ['sales.view', 'sales.create', 'sales.delete'],
        ];

        $allPermissions = [];
        foreach ($permissionGroups as $group => $permissions) {
            foreach ($permissions as $permName) {
                $allPermissions[] = Permission::create([
                    'name' => $permName,
                    'group' => $group,
                    'guard_name' => 'web',
                ]);
            }
        }

        // Create Super Admin role with all permissions
        $superAdmin = Role::create(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdmin->permissions()->attach(collect($allPermissions)->pluck('id'));

        // Create basic roles
        $editor = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
        $viewer = Role::create(['name' => 'Viewer', 'guard_name' => 'web']);

        // Assign view permissions to Viewer
        $viewPermissions = Permission::where('name', 'like', '%.view')->pluck('id');
        $viewer->permissions()->attach($viewPermissions);

        // Assign view + create + edit to Editor
        $editorPermissions = Permission::where('name', 'not like', '%.delete')->pluck('id');
        $editor->permissions()->attach($editorPermissions);

        // Create admin user
        $admin = User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('password'),
        ]);
        $admin->roles()->attach($superAdmin->id);

        // Create menu structure
        $platform = Menu::create([
            'name' => 'Platform',
            'order' => 0,
        ]);

        Menu::create([
            'name' => 'Dashboard',
            'route' => '/',
            'icon' => 'LayoutDashboard',
            'order' => 0,
            'permission_key' => 'dashboard',
            'parent_id' => $platform->id,
        ]);

        // Transactions group
        $transactions = Menu::create([
            'name' => 'Transactions',
            'order' => 2,
        ]);

        Menu::create([
            'name' => 'Purchases',
            'route' => '/purchases',
            'icon' => 'ShoppingCart',
            'order' => 0,
            'permission_key' => 'purchases',
            'parent_id' => $transactions->id,
        ]);

        Menu::create([
            'name' => 'Sales',
            'route' => '/sales',
            'icon' => 'ShoppingBag',
            'order' => 1,
            'permission_key' => 'sales',
            'parent_id' => $transactions->id,
        ]);

        Menu::create([
            'name' => 'Stock',
            'route' => '/stock',
            'icon' => 'Package',
            'order' => 2,
            'permission_key' => 'stock',
            'parent_id' => $transactions->id,
        ]);

        // Master Data group
        $masterData = Menu::create([
            'name' => 'Master Data',
            'order' => 1,
        ]);

        Menu::create([
            'name' => 'Categories',
            'route' => '/categories',
            'icon' => 'Tags',
            'order' => 0,
            'permission_key' => 'categories',
            'parent_id' => $masterData->id,
        ]);

        Menu::create([
            'name' => 'Products',
            'route' => '/products',
            'icon' => 'Package',
            'order' => 1,
            'permission_key' => 'products',
            'parent_id' => $masterData->id,
        ]);

        // Management group
        $management = Menu::create([
            'name' => 'Management',
            'order' => 3,
        ]);

        Menu::create([
            'name' => 'User Management',
            'route' => '/admin/users',
            'icon' => 'Users',
            'order' => 0,
            'permission_key' => 'users',
            'parent_id' => $management->id,
        ]);

        Menu::create([
            'name' => 'Role Management',
            'route' => '/admin/roles',
            'icon' => 'Shield',
            'order' => 1,
            'permission_key' => 'roles',
            'parent_id' => $management->id,
        ]);

        Menu::create([
            'name' => 'Menu Management',
            'route' => '/admin/menus',
            'icon' => 'Menu',
            'order' => 2,
            'permission_key' => 'menus',
            'parent_id' => $management->id,
        ]);

        Menu::create([
            'name' => 'Permission Management',
            'route' => '/admin/permissions',
            'icon' => 'KeyRound',
            'order' => 3,
            'permission_key' => 'permissions',
            'parent_id' => $management->id,
        ]);
    }
}
