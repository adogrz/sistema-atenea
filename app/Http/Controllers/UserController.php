<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Sede;
use App\Models\User;
use App\Services\RoleAssignmentService;
use App\Services\UserVisibilityService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests;

    protected $visibilityService;
    protected $roleAssignmentService;

    public function __construct(
        UserVisibilityService $visibilityService,
        RoleAssignmentService $roleAssignmentService
    )
    {
        $this->visibilityService = $visibilityService;
        $this->roleAssignmentService = $roleAssignmentService;
    }

    /**
     * Listado de usuarios filtrado por visibilidad.
     */
    public function index(Request $request)
    {
        // La política se encarga de la autorización.
        $this->authorize('viewAny', User::class);

        $userAuth = $request->user();

        $visibleUsers = $this->visibilityService->getVisibleUsers($userAuth);
        $assignableRoles = $this->roleAssignmentService->getAssignableRoles($userAuth);
        $allRoles = Role::all(['id', 'name', 'description']);
        $sedes = Sede::all(['id', 'name', 'description']);
        $areas = Area::all(['id', 'name', 'description']);

        return Inertia::render('dashboard-users', [
            'roles' => $allRoles,
            'assignableRoles' => $assignableRoles,
            'sedes' => $sedes,
            'areas' => $areas,

            'users' => $visibleUsers->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'sede_name' => $user->sede_name,
                'sede_description' => $user->sede->description ?? null,
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'pivot' => [
                        'is_primary' => $role->pivot->is_primary ?? false,
                        'expires_at' => $role->pivot->expires_at,
                    ],
                ]),
                'areas' => $user->areas->map(fn($area) => [
                    'id' => $area->id,
                    'name' => $area->name,
                    'description' => $area->description,
                    'pivot' => [
                        'is_primary' => $area->pivot->is_primary ?? false,
                    ],
                ]),
            ]),
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo usuario.
     */
    public function create()
    {
        $this->authorize('create', User::class);

        $currentUser = auth()->user();
        $roleAssignmentService = app(RoleAssignmentService::class);

        $assignableRoles = collect($roleAssignmentService->getAssignableRoles($currentUser))->map(fn($role) => [
            'name' => $role->name,
            'description' => $role->description,
        ]);

        $sedesQuery = Sede::query();
        if ($currentUser->hasPermissionTo('user-view-own-sede')) {
            $sedesQuery->where('name', $currentUser->sede_name);
        }
        $sedes = $sedesQuery->get(['name', 'description']);

        return Inertia::render('users/register', [
            'assignableRoles' => $assignableRoles,
            'sedes' => $sedes,
        ]);
    }

    /**
     * Crea un nuevo usuario.
     */
    public function store(Request $request)
    {
        // La política se encarga de la autorización.
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed|min:8',
            'sede_name' => 'required|string|exists:sedes,name',
            'roles' => 'required|array|min:1',
            'roles.*.name' => 'required|string|exists:roles,name',
            'roles.*.is_primary' => 'boolean',
        ]);

        foreach ($validated['roles'] as $roleData) {
            if (!$this->roleAssignmentService->canAssignRole($request->user(), $roleData['name'])) {
                return back()->withErrors(['roles' => "No tienes permiso para asignar el rol: {$roleData['name']}"]);
            }
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'sede_name' => $validated['sede_name'],
            'status' => 'active',
        ]);

        $user->syncRolesWithExpiration($validated['roles']);

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Crear',
                'attributes' => $user->only(['name', 'email', 'sede_name']),
                'roles' => $validated['roles']
            ])
            ->event('created')
            ->log('Usuario creado');

        return redirect()->route('users.index')->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Actualiza un usuario existente con gestión de roles temporales y áreas.
     */
    public function update(Request $request, User $user)
    {
        // La política se encarga de la autorización.
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'status' => 'required|in:active,inactive',
            'sede_name' => 'required|string|exists:sedes,name',
            'roles' => 'required|array|min:1',
            'roles.*.name' => 'required|string|exists:roles,name',
            'roles.*.expires_at' => 'nullable|date',
            'roles.*.is_primary' => 'boolean',
            'areas' => 'nullable|array',
            'areas.*.id' => 'exists:areas,id',
            'areas.*.is_primary' => 'boolean',
        ]);

        // Verificar permisos para asignar roles
        foreach ($validated['roles'] as $roleData) {
            if (!$this->roleAssignmentService->canAssignRole($request->user(), $roleData['name'])) {
                return back()->withErrors(['roles' => "No tienes permiso para asignar el rol: {$roleData['name']}"]);
            }
        }

        // Verificar restricciones de sede
        if (
            $request->user()->hasPermissionTo('user-view-own-sede') &&
            $request->user()->sede_name !== $validated['sede_name']
        ) {
            return back()->withErrors(['sede_name' => "No puedes asignar un usuario a una sede diferente a la tuya"]);
        }

        // Verificar restricciones de área
        if ($request->user()->hasPermissionTo('user-view-own-area') && isset($validated['areas']) && !empty($validated['areas'])) {
            $userAreaIds = $request->user()->areas->pluck('id')->toArray();
            foreach ($validated['areas'] as $area) {
                if (!in_array($area['id'], $userAreaIds)) {
                    return back()->withErrors(['areas' => "No puedes asignar un área a la que no perteneces"]);
                }
            }
        }

        // Guardar datos originales para log
        $original = $user->only(['name', 'email', 'status', 'sede_name']);
        $originalRoles = $user->roles->map(fn($r) => [
            'name' => $r->name,
            'is_primary' => $r->pivot->is_primary ?? false,
            'expires_at' => $r->pivot->expires_at
        ])->toArray();

        $originalAreas = $user->areas->map(fn($a) => [
            'id' => $a->id,
            'name' => $a->name,
            'is_primary' => $a->pivot->is_primary ?? false,
        ])->toArray();

        // Actualizar roles con información de expiración
        $user->syncRolesWithExpiration($validated['roles']);

        // Actualizar áreas (si se proporcionaron)
        $areasSync = [];
        if (!empty($validated['areas'])) {
            foreach ($validated['areas'] as $area) {
                $areasSync[$area['id']] = ['is_primary' => $area['is_primary'] ?? false];
            }

            // Si es estudiante, asegurarse de que tenga asignada el área de matemáticas
            if ($user->hasRole('estudiante')) {
                $matematicasArea = Area::where('name', 'matematicas')->first();
                if ($matematicasArea && !isset($areasSync[$matematicasArea->id])) {
                    // Si no se seleccionó matemáticas, añadirla como no principal
                    $areasSync[$matematicasArea->id] = ['is_primary' => false];
                }
            }
        } elseif ($user->hasRole('estudiante')) {
            // Si es estudiante y no se proporcionaron áreas, asignar matemáticas por defecto
            $matematicasArea = Area::where('name', 'matematicas')->first();
            if ($matematicasArea) {
                $areasSync[$matematicasArea->id] = ['is_primary' => true];
            }
        }

        // Sincronizar áreas (incluso si es un array vacío para roles que no necesitan áreas)
        $user->areas()->sync($areasSync);

        // Actualizar otros campos
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'status' => $validated['status'],
            'sede_name' => $validated['sede_name'],
        ]);

        // Cargar datos actualizados para el log
        $user->load(['roles', 'areas']);

        // Datos actualizados para log
        $updatedRoles = $user->roles->map(fn($r) => [
            'name' => $r->name,
            'is_primary' => $r->pivot->is_primary ?? false,
            'expires_at' => $r->pivot->expires_at
        ])->toArray();

        $updatedAreas = $user->areas->map(fn($a) => [
            'id' => $a->id,
            'name' => $a->name,
            'is_primary' => $a->pivot->is_primary ?? false,
        ])->toArray();

        // Registro de actividad
        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Actualizar',
                'old' => array_merge($original, [
                    'roles' => $originalRoles,
                    'areas' => $originalAreas
                ]),
                'attributes' => array_merge($user->only(['name', 'email', 'status', 'sede_name']), [
                    'roles' => $updatedRoles,
                    'areas' => $updatedAreas
                ]),
            ])
            ->event('updated')
            ->log('Usuario actualizado');

        return redirect()->back()->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Elimina lógicamente (soft-delete) un usuario.
     */
    public function destroy(Request $request, User $user)
    {
        // La política se encarga de la autorización.
        $this->authorize('delete', $user);

        if ($user->trashed()) {
            return back()->withErrors(['error' => 'Este usuario ya está eliminado.']);
        }

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Eliminar',
                'attributes' => $user->only(['name', 'email', 'sede_name']),
            ])
            ->event('deleted')
            ->log('Eliminar Usuario');

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    /**
     * Restaura un usuario previamente eliminado.
     */
    public function restore(Request $request, $id)
    {
        $user = User::onlyTrashed()->findOrFail($id);

        // La política se encarga de la autorización.
        $this->authorize('restore', $user);

        $user->restore();

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Restaurar',
                'attributes' => $user->only(['name', 'email', 'sede_name']),
            ])
            ->event('restored')
            ->log('Usuario restaurado');

        return back()->with('success', 'Usuario restaurado.');
    }

    /**
     * Envía un enlace de recuperación de contraseña al usuario.
     */
    public function sendResetLink(Request $request, User $user)
    {
        // La política se encarga de la autorización.
        $this->authorize('sendResetLink', $user);

        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            activity('usuarios')
                ->performedOn($user)
                ->causedBy($request->user())
                ->event('envio-recuperacion-contraseña')
                ->log("Se envió enlace de recuperación de contraseña");

            return back()->with('success', 'Se envió el enlace de recuperación.');
        } else {
            return back()->withErrors(['email' => __($status)]);
        }
    }
}
