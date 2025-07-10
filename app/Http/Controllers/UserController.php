<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Sede;
use App\Models\User;
use App\Services\RoleAssignmentService;
use App\Services\UserVisibilityService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests;

    protected UserVisibilityService $visibilityService;
    protected RoleAssignmentService $roleAssignmentService;

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
    public function index(): Response
    {
        // La política se encarga de la autorización.
        $this->authorize('viewAny', User::class);

        // Obtener usuarios visibles para el usuario autenticado
        $users = $this->visibilityService->getVisibleUsers(auth()->user());

        // Cargar los roles con la información de la tabla pivote
        $users->load(['getAllRolesWithExpired', 'sede', 'areas']);

        // Mapear los resultados para que la relación 'getAllRolesWithExpired' se asigne a 'roles'
        // y para añadir explícitamente la descripción de la sede.
        $users->each(function ($user) {
            $user->setRelation('roles', $user->getAllRolesWithExpired);
            unset($user->getAllRolesWithExpired);

            // Asegurarse de que la descripción de la sede esté disponible
            if ($user->sede) {
                $user->sede_description = $user->sede->description;
            }
        });

        // Obtener roles, sedes y áreas para los filtros y modales
        $assignableRoles = $this->roleAssignmentService->getAssignableRoles(auth()->user());
        $sedes = Sede::all();
        $areas = Area::all();

        return Inertia::render('dashboard-users', [
            'users' => $users,
            'roles' => Role::select('id', 'name', 'description')->get(),
            'assignableRoles' => $assignableRoles,
            'sedes' => $sedes,
            'areas' => $areas,
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo usuario.
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        $currentUser = auth()->user();
        $roleAssignmentService = app(RoleAssignmentService::class);

        $assignableRoles = collect($roleAssignmentService->getAssignableRoles($currentUser))->map(fn($role) => [
            'name' => $role['name'],
            'description' => $role['description'],
        ]);

        $sedesQuery = Sede::query();
        if ($currentUser->hasPermissionTo('users:view-sede')) {
            $sedesQuery->where('name', $currentUser->sede_name);
        }
        $sedes = $sedesQuery->get(['name', 'description']);

        // Obtener todas las áreas académicas
        $areasQuery = Area::query();
        if ($currentUser->hasPermissionTo('users:view-area')) {
            // Si el usuario está restringido a sus propias áreas
            $userAreaIds = $currentUser->areas->pluck('id');
            $areasQuery->whereIn('id', $userAreaIds);
        }
        $areas = $areasQuery->get(['name', 'description']);

        return Inertia::render('users/register', [
            'assignableRoles' => $assignableRoles,
            'sedes' => $sedes,
            'areas' => $areas, // Añadir áreas a los datos enviados a la vista
        ]);
    }

    /**
     * Crea un nuevo usuario.
     */
    public function store(Request $request): RedirectResponse
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
            'roles.*.expires_at' => 'nullable|date', // <-- Añadir esta validación
            'area_name' => 'nullable|string|exists:areas,name',
        ]);

        // Verificar si los roles seleccionados requieren un área
        $rolesRequiringArea = ['coordinador-area', 'mentor', 'instructor', 'calificador'];
        $requiresArea = false;

        foreach ($validated['roles'] as $roleData) {
            // Verificar permisos para asignar rol
            if (!$this->roleAssignmentService->canAssignRole($request->user(), $roleData['name'])) {
                return back()->withErrors(['roles' => "No tienes permiso para asignar el rol: {$roleData['name']}"]);
            }

            // Verificar si algún rol requiere área
            if (in_array($roleData['name'], $rolesRequiringArea, true)) {
                $requiresArea = true;
            }
        }

        // Si requiere área, pero no se seleccionó una
        if ($requiresArea && empty($validated['area_name'])) {
            return back()->withErrors(['area_name' => 'El área académica es requerida para los roles seleccionados.']);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'sede_name' => $validated['sede_name'],
            'status' => 'active',
        ]);

        // Usar el método corregido para sincronizar roles
        $user->syncRolesWithExpiration($validated['roles']);

        // Asignar el área al usuario si se seleccionó una
        if (!empty($validated['area_name'])) {
            $area = Area::query()->where('name', '=', $validated['area_name'])->first();
            if ($area) {
                $user->areas()->sync([
                    $area->id => ['is_primary' => $requiresArea]
                ]);
            }
        }

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Crear',
                'attributes' => $user->only(['name', 'email', 'sede_name']),
                'roles' => $validated['roles'],
                'areas' => $validated['area_name'] ? [$validated['area_name']] : []
            ])
            ->event('created')
            ->log('Usuario creado');

        return redirect()->route('users.index')->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Actualiza un usuario existente con gestión de roles temporales y áreas.
     */
    public function update(Request $request, User $user): RedirectResponse
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
            $request->user()->sede_name !== $validated['sede_name'] &&
            $request->user()->hasPermissionTo('users:view-sede')
        ) {
            return back()->withErrors(['sede_name' => "No puedes asignar un usuario a una sede diferente a la tuya"]);
        }

        // Verificar restricciones de área
        if (!empty($validated['areas'])
            && $request->user()->hasPermissionTo('users:view-area')) {
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
                $matematicasArea = Area::where('name', '=', 'matematicas', 'and')->first();
                if ($matematicasArea && !isset($areasSync[$matematicasArea->id])) {
                    // Si no se seleccionó matemáticas, añadirla como no principal
                    $areasSync[$matematicasArea->id] = ['is_primary' => false];
                }
            }
        } elseif ($user->hasRole('estudiante')) {
            // Si es estudiante y no se proporcionaron áreas, asignar matemáticas por defecto
            $matematicasArea = Area::where('name', '=', 'matematicas', 'and')->first();
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
    public function destroy(Request $request, User $user): RedirectResponse
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
    public function restore(Request $request, $id): RedirectResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);

        // La política se encarga de la autorización.
        $this->authorize('restore', $user);

        User::withTrashed()->where('id', $id)->restore();

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
    public function sendResetLink(Request $request, User $user): RedirectResponse
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
        }

        return back()->withErrors(['email' => __($status)]);
    }

    /*
    * Muestra información detallada de un usuario para depuración.
    */
    public function debug(User $user): JsonResponse
    {
        // La autorización se maneja con el middleware en la ruta.
        // Opcionalmente, puedes añadir una política si es necesario.
        // $this->authorize('view', $user);

        // Cargar roles con datos de la tabla pivote (is_primary, expires_at)
        $rolesConPivot = $user->getAllRolesWithExpired()->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'pivot' => [
                    'is_primary' => (bool)$role->pivot->is_primary,
                    'expires_at' => $role->pivot->expires_at,
                ],
            ];
        });

        // Cargar áreas con datos de la tabla pivote (is_primary)
        $areasConPivot = $user->areas()->withPivot('is_primary')->get()->map(function ($area) {
            return [
                'id' => $area->id,
                'name' => $area->name,
                'description' => $area->description,
                'pivot' => [
                    'is_primary' => (bool)$area->pivot->is_primary,
                ],
            ];
        });

        $infoDepuracion = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'sede' => $user->sede,
            'roles_info' => $rolesConPivot,
            'areas_info' => $areasConPivot,
            'permisos_directos' => $user->getDirectPermissions()->pluck('name'),
            'permisos_via_roles' => $user->getPermissionsViaRoles()->pluck('name'),
        ];

        return response()->json($infoDepuracion, 200, [], JSON_PRETTY_PRINT);
    }
}
