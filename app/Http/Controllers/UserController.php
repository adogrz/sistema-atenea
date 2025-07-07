<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\User;
use App\Services\RoleAssignmentService;
use App\Services\UserVisibilityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    protected $visibilityService;
    protected $roleAssignmentService;

    public function __construct(
        UserVisibilityService $visibilityService,
        RoleAssignmentService $roleAssignmentService
    ) {
        $this->visibilityService = $visibilityService;
        $this->roleAssignmentService = $roleAssignmentService;
    }

    /**
     * Listado de usuarios filtrado por visibilidad.
     */
    public function index(Request $request)
    {
        // Obtener solo los usuarios visibles para el usuario actual
        $users = $this->visibilityService->getVisibleUsers($request->user());

        return Inertia::render('Usuarios/Index', [
            'users' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role_name' => $u->getPrimaryRole() ? $u->getPrimaryRole()->description : null,
                'sede_name' => $u->sede->description ?? $u->sede_name,
                'area_name' => $u->primaryArea() ? $u->primaryArea()->description : null,
                'status' => $u->status,
                'roles' => $u->roles->map(fn($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'description' => $r->description,
                    'pivot' => [
                        'is_primary' => $r->pivot->is_primary ?? false,
                        'expires_at' => $r->pivot->expires_at
                    ]
                ]),
                'areas' => $u->areas->map(fn($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'description' => $a->description,
                    'is_primary' => $a->pivot->is_primary ?? false,
                ]),
            ])
        ]);
    }

    /**
     * Muestra el formulario de creación de usuario.
     */
    public function store(Request $request)
    {
        $userAuth = $request->user();

        // Verificar si el usuario autenticado puede crear usuarios
        if (!$userAuth->hasPermissionTo('user-create')) {
            return back()->withErrors(['error' => 'No tienes permiso para crear usuarios.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed|min:8',
            'sede_name' => 'required|string|exists:sedes,name',
            'roles' => 'required|array|min:1',
            'roles.*.name' => 'required|string|exists:roles,name',
            'roles.*.is_primary' => 'boolean',
        ]);

        // Verificar si puede asignar el rol
        foreach ($validated['roles'] as $roleData) {
            if (!$this->roleAssignmentService->canAssignRole($userAuth, $roleData['name'])) {
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

        // Asignar roles
        $user->syncRolesWithExpiration($validated['roles']);

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($userAuth)
            ->withProperties([
                'event' => 'Crear',
                'attributes' => $user->only(['name', 'email', 'sede_name']),
                'roles' => $validated['roles']
            ])
            ->event('created')
            ->log('Usuario creado');

        return redirect()->back()->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Actualiza un usuario existente con gestión de roles temporales y áreas.
     */
    public function update(Request $request, User $user)
    {
        // Verificaciones existentes
        $userAuth = $request->user();

        if (!$userAuth) {
            return back()->withErrors(['error' => 'Sesión caducada o no autenticado.']);
        }

        // Verificar si puede editar este usuario
        if (!$this->roleAssignmentService->canEditUser($userAuth, $user)) {
            return back()->withErrors(['error' => 'No tienes permiso para editar este usuario.']);
        }

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
            if (!$this->roleAssignmentService->canAssignRole($userAuth, $roleData['name'])) {
                return back()->withErrors(['roles' => "No tienes permiso para asignar el rol: {$roleData['name']}"]);
            }
        }

        // Verificar restricciones de sede
        if (
            $userAuth->hasPermissionTo('user-view-own-sede') &&
            $userAuth->sede_name !== $validated['sede_name']
        ) {
            return back()->withErrors(['sede_name' => "No puedes asignar un usuario a una sede diferente a la tuya"]);
        }

        // Verificar restricciones de área
        if ($userAuth->hasPermissionTo('user-view-own-area') && isset($validated['areas']) && !empty($validated['areas'])) {
            $userAreaIds = $userAuth->areas->pluck('id')->toArray();
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
            ->causedBy($userAuth)
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
        $userAuth = $request->user();

        if ($user->id === $userAuth->id) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta.']);
        }

        if ($user->trashed()) {
            return back()->withErrors(['error' => 'Este usuario ya está eliminado.']);
        }

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($userAuth)
            ->withProperties([
                'event' => 'Eliminar',
                'attributes' => $user->only(['name', 'email', 'role_name', 'sede_name']),
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
        $user->restore();

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Restaurar',
                'attributes' => $user->only(['name', 'email', 'role_name', 'sede_name']),
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
