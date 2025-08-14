<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

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
        return array_merge(parent::share($request), [
            'appName' => config('app.name'),
            'auth' => [
                'user' => function () use ($request) {
                    if (!$request->user()) {
                        return null;
                    }

                    // Cargar usuario con todas sus relaciones y permisos
                    $user = $request->user()->load(['roles.permissions', 'sede', 'areas']);
                    $userData = $user->toArray();
                    $userData['permissions'] = $user->getAllPermissions()->pluck('name');

                    // Asegurarse de que los pivotes se cargan correctamente
                    $userData['roles'] = $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'description' => $role->description,
                            'pivot' => $role->pivot,
                        ];
                    });

                    $userData['areas'] = $user->areas->map(function ($area) {
                        return [
                            'id' => $area->id,
                            'name' => $area->name,
                            'description' => $area->description,
                            'pivot' => $area->pivot,
                        ];
                    });

                    return $userData;
                },
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ]);
    }
}
