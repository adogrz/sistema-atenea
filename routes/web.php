<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Sede;
use App\Models\Area;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;
use App\Services\UserVisibilityService;
use App\Services\RoleAssignmentService;

Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->hasPermissionTo('user-list')) {
            return redirect()->route('dashboard.usuarios');
        } else {
            return redirect()->route('usuario.dashboard');
        }
    }

    return redirect()->route('login');
})->name('home');

// Rutas para usuarios autenticados
Route::middleware(['check.status', 'auth', 'verified'])->group(function () {
    // Panel para usuarios normales
    Route::get('/home', function () {
        // Asegúrate de cargar los permisos junto con los roles
        $user = Auth::user()->load('roles', 'sede', 'areas');

        // Cargar los permisos explícitamente
        $permissions = $user->getAllPermissions()->pluck('name');

        return Inertia::render('home', [
            'auth' => [
                'user' => array_merge($user->toArray(), ['permissions' => $permissions])
            ]
        ]);
    })->name('usuario.dashboard');
});

// Rutas para gestión de usuarios (con permisos específicos)
Route::middleware(['check.status', 'auth', 'verified', 'permission:user-list'])->group(function () {
    // Dashboard admin
    Route::get('/dashboard', function () {
        $logs = Activity::with('causer')->latest()->get();
        return Inertia::render('dashboard', [
            'logs' => $logs,
        ]);
    })->name('dashboard');

    Route::resource('users', UserController::class)->except(['create', 'edit']);

    Route::post('/users/{user}/send-reset-link', [UserController::class, 'sendResetLink'])
        ->name('users.send-reset-link')
        ->middleware('permission:user-reset-password');

    Route::get('/dashboard/usuarios', function () {
        $userVisibilityService = app(UserVisibilityService::class);
        $roleAssignmentService = app(RoleAssignmentService::class);

        $currentUser = Auth::user();
        // Usar el servicio para obtener solo los usuarios que el usuario actual puede ver
        $users = $userVisibilityService->getVisibleUsers($currentUser);

        // Obtener roles que el usuario actual puede asignar
        $assignableRoles = collect($roleAssignmentService->getAssignableRoles($currentUser))->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'description' => $role->description,
        ]);

        // Obtener sedes, restringidas si es necesario
        $sedesQuery = Sede::query();
        if ($currentUser->hasPermissionTo('user-view-own-sede')) {
            $sedesQuery->where('name', $currentUser->sede_name);
        }
        $sedes = $sedesQuery->get()->map(fn($sede) => [
            'id' => $sede->id,
            'name' => $sede->name,
            'description' => $sede->description,
        ]);

        // Obtener áreas, restringidas si es necesario
        $areasQuery = Area::query();
        if ($currentUser->hasPermissionTo('user-view-own-area')) {
            $userAreaIds = $currentUser->areas->pluck('id')->toArray();
            $areasQuery->whereIn('id', $userAreaIds);
        }
        $areas = $areasQuery->get()->map(fn($area) => [
            'id' => $area->id,
            'name' => $area->name,
            'description' => $area->description,
        ]);

        return Inertia::render('dashboard_usuarios', [
            'users' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'status' => $u->status,
                'sede_name' => $u->sede->name ?? null,
                'sede_description' => $u->sede->description ?? null,
                'roles' => $u->roles->map(fn($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'description' => $r->description,
                    'pivot' => [
                        'is_primary' => $r->pivot->is_primary ?? false,
                        'expires_at' => $r->pivot->expires_at
                    ]
                ])->values(),
                'areas' => $u->areas->map(fn($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'description' => $a->description,
                    'pivot' => [
                        'is_primary' => $a->pivot->is_primary ?? false
                    ]
                ])->values(),
            ]),
            'roles' => Role::all(['id', 'name', 'description']),
            'assignableRoles' => $assignableRoles,
            'sedes' => $sedes,
            'areas' => $areas,
        ]);
    })->name('dashboard.usuarios');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
