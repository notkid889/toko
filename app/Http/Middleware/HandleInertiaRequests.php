<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'menus' => $user ? $this->getMenusForUser($user) : [],
        ];
    }

    /**
     * Build the menu tree filtered by the user's permissions.
     */
    private function getMenusForUser($user): array
    {
        $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();

        $roots = Menu::roots()
            ->ordered()
            ->with(['children' => fn ($q) => $q->ordered()])
            ->get();

        return $roots
            ->map(function (Menu $group) use ($userPermissions) {
                // Filter children by the user's permissions
                $children = $group->children->filter(function (Menu $child) use ($userPermissions) {
                    // If no permission_key is set, always show
                    if (!$child->permission_key) {
                        return true;
                    }
                    // Check if user has the <permission_key>.view permission
                    return in_array("{$child->permission_key}.view", $userPermissions);
                })->values();

                // Skip group entirely if it has no visible children
                if ($children->isEmpty()) {
                    return null;
                }

                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'order' => $group->order,
                    'children' => $children->map(fn (Menu $child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'route' => $child->route,
                        'icon' => $child->icon,
                        'order' => $child->order,
                        'permission_key' => $child->permission_key,
                    ])->toArray(),
                ];
            })
            ->filter()
            ->values()
            ->toArray();
    }
}

