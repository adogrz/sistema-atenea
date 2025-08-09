<?php

namespace App\Http\Controllers;

use App\Notifications\UserCredentialsNotification;
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
use App\Config\RolesConfig;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests;

    protected UserVisibilityService $visibilityService;
    protected RoleAssignmentService $roleAssignmentService;

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
    public function index(): Response
    {
        // La política se encarga de la autorización.
        $this->authorize('viewAny', User::class);

        $currentUser = auth()->user();

        // Obtener usuarios visibles para el usuario autenticado
        $users = $this->visibilityService->getVisibleUsers($currentUser);

        // Cargar los roles con la información de la tabla pivote
        $users->load(['getAllRolesWithExpired', 'sede', 'areas']);

        // Mapear los resultados para que la relación 'getAllRolesWithExpired' se asigne a 'roles'
        // y para añadir explícitamente la descripción de la sede.
        $users->each(function ($user) use ($currentUser) {
            $user->setRelation('roles', $user->getAllRolesWithExpired);
            unset($user->getAllRolesWithExpired);

            // Añadir la capacidad de eliminación y edición para el usuario actual
            $user->can_be_deleted = $currentUser->can('delete', $user);
            $user->can_be_edited = $currentUser->can('update', $user);

            // Asegurarse de que la descripción de la sede esté disponible de forma segura
            $user->sede_description = $user->sede->description ?? null;
        });

        // Obtener datos comunes filtrados según permisos del usuario
        $commonData = $this->getCommonUserData($currentUser);

        // Obtener roles para el listado (completo para la interfaz)
        $roles = Role::select('id', 'name', 'description')->get();

        return Inertia::render('dashboard-users', [
            'users' => $users,
            'roles' => $roles,
            'assignableRoles' => $commonData['assignableRoles'],
            'sedes' => $commonData['sedes'],
            'areas' => $commonData['areas'],
        ]);
    }

    /**
     * Muestra el formulario para editar un usuario existente.
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        // Cargar la relación getAllRolesWithExpired que incluye los datos pivot
        $user->load('getAllRolesWithExpired');

        // Asignar la relación cargada a la propiedad 'roles' para que el frontend la reciba como espera
        // Esto es crucial porque el frontend espera 'user.roles' con is_primary
        $user->setRelation('roles', $user->getAllRolesWithExpired);

        $currentUser = auth()->user();
        $commonData = $this->getCommonUserData($currentUser);

        return Inertia::render('users/edit', array_merge([
            'user' => $user,
        ], $commonData));
    }

    /**
     * Crea un nuevo usuario.
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        $currentUser = auth()->user();
        $roleAssignmentService = app(RoleAssignmentService::class);

        return Inertia::render('users/register', $this->getCommonUserData($currentUser));
    }

    /**
     * Obtiene datos comunes para la creación y edición de usuarios.
     */
    private function getCommonUserData(User $currentUser): array
    {
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

        $areasQuery = Area::query();
        if ($currentUser->hasPermissionTo('users:view-area')) {
            $userAreaIds = $currentUser->areas->pluck('id');
            $areasQuery->whereIn('id', $userAreaIds);
        }
        $areas = $areasQuery->get(['name', 'description']);

        return [
            'assignableRoles' => $assignableRoles,
            'sedes' => $sedes,
            'areas' => $areas,
        ];
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
            'roles.*.expires_at' => 'nullable|date|after:today',
            'area_name' => 'nullable|string|exists:areas,name',
            'send_credentials_email' => 'boolean',
        ]);

        // Verificación fuerte de asignación de roles en backend
        $actor = $request->user();
        if (!$actor->hasPermissionTo('roles:assign')) {
            abort(403, 'No autorizado para asignar roles.');
        }
        foreach ($validated['roles'] as $roleData) {
            if (!app(RoleAssignmentService::class)->canAssignRole($actor, $roleData['name'])) {
                abort(403, "No puede asignar el rol {$roleData['name']}.");
            }
        }

        // Verificar si los roles seleccionados requieren un área
        $rolesRequiringArea = RolesConfig::getRolesRequiringArea();
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

        // Asegurar que haya un rol principal
        $roles = $validated['roles'];

        // Si solo hay un rol, marcarlo como principal
        if (count($roles) === 1) {
            $roles[0]['is_primary'] = true;
        }
        // Si hay varios roles pero ninguno es principal, marcar el primero
        else {
            $hasPrimary = false;
            foreach ($roles as $role) {
                if (isset($role['is_primary']) && $role['is_primary']) {
                    $hasPrimary = true;
                    break;
                }
            }

            if (!$hasPrimary && count($roles) > 0) {
                $roles[0]['is_primary'] = true;
            }
        }

        // Usar el método corregido para sincronizar roles
        $user->syncRolesWithExpiration($roles);

        // Asignar el área al usuario si se seleccionó una
        if (!empty($validated['area_name'])) {
            $area = Area::query()->where('name', '=', $validated['area_name'])->first();
            if ($area) {
                $user->areas()->sync([
                    $area->id => ['is_primary' => $requiresArea]
                ]);
            }
        }

        if ($validated['send_credentials_email']) {
            $user->notify(new UserCredentialsNotification($validated['password']));
        }

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Crear',
                'attributes' => $user->only(['name', 'email', 'sede_name']),
                'roles' => $roles,
                'areas' => $validated['area_name'] ? [$validated['area_name']] : []
            ])
            ->event('created')
            ->log('Usuario creado');

        $successMessage = [
            'title' => 'Usuario Creado',
            'description' => $validated['send_credentials_email']
                ? 'El correo de credenciales ha sido encolado para su envío.'
                : 'El usuario ha sido creado correctamente.',
        ];

        return redirect()->route('users.index')->with('success', $successMessage);
    }

    /**
     * Actualiza un usuario.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        // La política se encarga de la autorización.
        $this->authorize('update', $user);

        // Capturar datos originales para el log de actividad
        $original = $user->only(['name', 'email', 'sede_name', 'status']);

        // Cargar roles con datos de pivote
        $user->load(['roles', 'areas']);
        $originalRoles = $user->roles->map(fn($r) => [
            'name' => $r->name,
            'is_primary' => (bool)$r->pivot->is_primary,
            'expires_at' => $r->pivot->expires_at
        ])->toArray();

        $originalAreas = $user->areas->map(fn($a) => [
            'id' => $a->id,
            'name' => $a->name,
            'is_primary' => (bool)$a->pivot->is_primary,
        ])->toArray();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'sede_name' => 'required|string|exists:sedes,name',
            'status' => 'required|string|in:active,inactive',
            'roles' => 'sometimes|array',
            'roles.*.name' => 'required_with:roles|string|exists:roles,name',
            'roles.*.is_primary' => 'sometimes|boolean',
            'roles.*.expires_at' => 'nullable|date',
            'area_name' => 'nullable|string|exists:areas,name',
        ]);

        $rolesRequiringArea = RolesConfig::getRolesRequiringArea();
        $requiresArea = false;
        $hasRolesInput = array_key_exists('roles', $validated);

        if ($hasRolesInput) {
            $actor = $request->user();
            if (!$actor->hasPermissionTo('roles:assign')) {
                abort(403, 'No autorizado para modificar roles.');
            }

            foreach ($validated['roles'] as $roleData) {
                if (!app(RoleAssignmentService::class)->canAssignRole($actor, $roleData['name'])) {
                    abort(403, "No puede asignar el rol {$roleData['name']}.");
                }
                if (in_array($roleData['name'], $rolesRequiringArea, true)) {
                    $requiresArea = true;
                }
            }

            // Asegurar que haya un rol principal
            $roles = $validated['roles'];

            // Si solo hay un rol, marcarlo como principal
            if (count($roles) === 1) {
                $roles[0]['is_primary'] = true;
            }
            // Si hay varios roles pero ninguno es principal, marcar el primero
            else {
                $hasPrimary = false;
                foreach ($roles as &$role) {
                    // Asegurarnos que is_primary es explícitamente un booleano
                    $role['is_primary'] = isset($role['is_primary']) && $role['is_primary'] ? true : false;

                    if ($role['is_primary']) {
                        $hasPrimary = true;
                    }
                }

                if (!$hasPrimary && count($roles) > 0) {
                    $roles[0]['is_primary'] = true;
                }
            }

            // Formatear explícitamente los datos para evitar problemas con los tipos
            $formattedRoles = array_map(function ($role) {
                return [
                    'name' => $role['name'],
                    'is_primary' => (bool)($role['is_primary'] ?? false),
                    'expires_at' => isset($role['expires_at']) && $role['expires_at'] ? $role['expires_at'] : null,
                ];
            }, $roles);

            // Actualizar roles con información de expiración
            $user->syncRolesWithExpiration($formattedRoles);
        }

        // Si se requieren áreas por los roles enviados pero no se envió área
        if ($hasRolesInput && $requiresArea && empty($validated['area_name'])) {
            return back()->withErrors(['area_name' => 'El área académica es requerida para los roles seleccionados.']);
        }

        // Verificar restricciones de sede
        if (
            $request->user()->hasPermissionTo('users:view-sede') &&
            $request->user()->sede_name !== $validated['sede_name']
        ) {
            return back()->withErrors(['sede_name' => "No puedes asignar un usuario a una sede diferente a la tuya"]);
        }

        // Verificar restricciones de área
        if (!empty($validated['area_name']) && $request->user()->hasPermissionTo('users:view-area')) {
            $userAreaNames = $request->user()->areas->pluck('name')->toArray();
            if (!in_array($validated['area_name'], $userAreaNames)) {
                return back()->withErrors(['area_name' => "No puedes asignar un área a la que no perteneces"]);
            }
        }

        // Actualizar área solo si llegó area_name o si llegaron roles que ya no requieren área
        if (!empty($validated['area_name'])) {
            $area = Area::where('name', $validated['area_name'])->first();
            if ($area) {
                $user->areas()->sync([
                    $area->id => ['is_primary' => $requiresArea]
                ]);
            }
        } elseif ($hasRolesInput && !$requiresArea) {
            // Solo desvincular si efectivamente se actualizaron roles y ya no requieren área
            $user->areas()->sync([]);
        }

        // Actualizar otros campos
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'sede_name' => $validated['sede_name'],
            'status' => $validated['status'],
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
                'attributes' => array_merge($user->only(['name', 'email', 'sede_name']), [
                    'roles' => $updatedRoles,
                    'areas' => $updatedAreas
                ]),
            ])
            ->event('updated')
            ->log('Usuario actualizado');

        return redirect()->route('users.index')->with('success', 'Usuario actualizado correctamente.');
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

        return redirect()->route('users.index')->with('success', [
            'title' => 'Usuario eliminado correctamente',
            'description' => 'El usuario ha sido eliminado del sistema',
            'action' => [
                'label' => 'Deshacer',
                'route' => 'users.restore',
                'params' => ['id' => $user->id]
            ]
        ]);
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
