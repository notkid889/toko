<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MenuRequest;
use App\Models\Menu;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        $menus = Menu::with('children', 'parent')
            ->ordered()
            ->get();

        $parentMenus = Menu::roots()->ordered()->get(['id', 'name']);

        return Inertia::render('Admin/Menus/Index', [
            'menusData' => $menus,
            'parentMenus' => $parentMenus,
        ]);
    }

    public function store(MenuRequest $request): RedirectResponse
    {
        Menu::create($request->validated());

        return redirect()->route('admin.menus.index')
            ->with('success', 'Menu created successfully.');
    }

    public function edit(Menu $menu): Response
    {
        $menus = Menu::with('children', 'parent')
            ->ordered()
            ->get();

        $parentMenus = Menu::roots()
            ->where('id', '!=', $menu->id)
            ->ordered()
            ->get(['id', 'name']);

        return Inertia::render('Admin/Menus/Index', [
            'menus' => $menus,
            'parentMenus' => $parentMenus,
            'editMenu' => $menu,
        ]);
    }

    public function update(MenuRequest $request, Menu $menu): RedirectResponse
    {
        $menu->update($request->validated());

        return redirect()->route('admin.menus.index')
            ->with('success', 'Menu updated successfully.');
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->children()->update(['parent_id' => null]);
        $menu->delete();

        return redirect()->route('admin.menus.index')
            ->with('success', 'Menu deleted successfully.');
    }
}
