<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use App\Models\Responsable;
use App\Models\User;
use App\Models\Departamento;
use App\Models\Municipio;
use App\Models\Distrito;
use App\Models\CentroEducativo;
use App\Models\NivelEducativo;
use App\Models\Direccion;

use App\Notifications\UserCredentialsNotification;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

use Inertia\Inertia;
use Inertia\Response;

class AdmisionController extends Controller
{
    /*
     * Método de registro de estudiantes del proceso de admisión
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('=== INICIO PROCESO ADMISIÓN ===', ['request_data' => $request->all()]);

            $validated = $request->validate([

                // Estudiante
                'primer_nombre' => 'required|string|max:50',
                'segundo_nombre' => 'required|string|max:50',
                'primer_apellido' => 'required|string|max:50',
                'segundo_apellido' => 'required|string|max:50',
                'sexo' => 'required|in:H,M',
                'fecha_nacimiento' => 'required|date',
                'centro_educativo' => 'required|string|max:100',
                'codigo' => 'required|exists:centros_educativos,codigo',
                'nie' => 'required|string|unique:estudiantes,nie',
                'telefono_estudiante' => 'nullable|string|size:8',
                'telefono_casa' => 'nullable|string|size:8',
                'email' => 'required|email|unique:estudiantes,email',

                // Dirección estructurada
                'colonia' => 'required|string|min:3|max:100',
                'calle' => 'required|string|min:3|max:100',
                'numero_casa' => 'required|string|min:1|max:20',
                'punto_referencia' => 'nullable|string|max:150',
                'direccion' => 'nullable|string|max:255',

                'distrito' => 'required|exists:distritos,id',
                'departamento' => 'required|string',
                'municipio' => 'required|string',
                'nivel_educativo' => 'required|integer|exists:niveles_educativos,codigo',

                // Responsable 1
                'dui_responsable_1' => 'required|string|size:9',
                'nombres_responsable_1' => 'required|string|max:100',
                'apellidos_responsable_1' => 'required|string|max:100',
                'email_responsable_1' => 'nullable|email',
                'telefono_responsable_1' => 'required|string|size:8',
                'tipo_parentesco_1' => 'required|in:Madre,Padre,Abuelo,Tio,Tutor legal,Otro',
                'otro_parentesco_1' => 'nullable|string|max:50',
            ]);

            Log::info('✅ Validación inicial exitosa');

            // Validación condicional para responsable 2
            $hasSecondResponsableData = !empty($request->dui_responsable_2) ||
                !empty($request->nombres_responsable_2) ||
                !empty($request->apellidos_responsable_2) ||
                !empty($request->telefono_responsable_2) ||
                !empty($request->tipo_parentesco_2);

            if ($hasSecondResponsableData) {
                Log::info('Validando responsable 2...');
                $secondResponsableRules = [
                    'dui_responsable_2' => 'required|string|size:9',
                    'nombres_responsable_2' => 'required|string|max:100',
                    'apellidos_responsable_2' => 'required|string|max:100',
                    'telefono_responsable_2' => 'required|string|size:8',
                    'tipo_parentesco_2' => 'required|in:Madre,Padre,Abuelo,Tio,Tutor legal,Otro',
                    'email_responsable_2' => 'nullable|email',
                    'otro_parentesco_2' => 'nullable|string|max:50',
                ];

                $validated = array_merge($validated, $request->validate($secondResponsableRules));
                Log::info('✅ Validación responsable 2 exitosa');
            } else {
                // Si no hay datos del responsable 2, establecer valores por defecto
                $secondResponsableDefaults = [
                    'dui_responsable_2' => null,
                    'nombres_responsable_2' => null,
                    'apellidos_responsable_2' => null,
                    'telefono_responsable_2' => null,
                    'tipo_parentesco_2' => null,
                    'email_responsable_2' => null,
                    'otro_parentesco_2' => null,
                ];

                $validated = array_merge($validated, $secondResponsableDefaults);
                Log::info('ℹ️ Sin responsable 2, usando valores por defecto');
            }

            // Creación de passwordTemporal
            $passwordTemporal = bin2hex(random_bytes(6)); // genera 12 caracteres hexadecimales
            Log::info('✅ Password temporal generado');

            // Obtención de nivel educativo
            $nivelEducativo = NivelEducativo::where('codigo', $validated['nivel_educativo'])->first();
            Log::info('✅ Nivel educativo encontrado', ['nivel' => $nivelEducativo->id ?? 'null']);

            // Buscar o crear usuario
            Log::info('Creando/buscando usuario...');
            $usuario = User::firstOrCreate(
                ['email' => $validated['email']],          // condiciones de búsqueda
                [                                           // atributos para creación
                    'name' => trim($validated['primer_nombre'] . ' ' . $validated['segundo_nombre'] . ' ' . $validated['primer_apellido'] . ' ' . $validated['segundo_apellido']),
                    'email' => $validated['email'],
                    'password' => bcrypt($passwordTemporal),
                    'sede_name' => 'central',  // Todos los estudiantes de admisión van a sede central
                    'status' => 'active',
                ]
            );
            Log::info('✅ Usuario creado/encontrado', ['user_id' => $usuario->id, 'was_created' => $usuario->wasRecentlyCreated]);

            // Asegurar que el usuario tenga asignada la sede central
            if (empty($usuario->sede_name)) {
                $usuario->update(['sede_name' => 'central']);
                Log::info('✅ Sede central asignada al usuario existente', ['user_id' => $usuario->id]);
            }

            // Asignar rol de estudiante al usuario (solo si es un usuario nuevo)
            if ($usuario->wasRecentlyCreated) {
                Log::info('Asignando roles con expiración...');
                $usuario->syncRolesWithExpiration([
                    [
                        'name' => 'estudiante',
                        'is_primary' => true,
                        'expires_at' => null
                    ]
                ]);
                Log::info('✅ Roles con expiración asignados');
            }

            // Generación de codigo temporal
            $codigoTemporal = 'ASP-' . $validated['primer_apellido'][0] . '' . $validated['segundo_apellido'][0] . '' . substr($validated['nie'], -3) . '-' . strtoupper(substr(uniqid(), -3)); // Genera un identificador unico temporal
            Log::info('✅ Código temporal generado', ['codigo' => $codigoTemporal]);

            // Buscar o crear dirección (para evitar duplicados)
            Log::info('Creando/buscando dirección...');
            $direccion = Direccion::similar(
                $validated['colonia'],
                $validated['calle'],
                $validated['numero_casa'],
                $validated['distrito']
            )->first();

            if (!$direccion) {
                $direccion = Direccion::create([
                    'colonia' => $validated['colonia'],
                    'calle' => $validated['calle'],
                    'numero_casa' => $validated['numero_casa'],
                    'punto_referencia' => $validated['punto_referencia'] ?? null,
                    'direccion_completa' => $validated['direccion'] ?? null,
                    'distrito_id' => $validated['distrito'],
                ]);
                Log::info('✅ Dirección creada', ['direccion_id' => $direccion->id]);
            } else {
                Log::info('✅ Dirección encontrada', ['direccion_id' => $direccion->id]);
            }

            // Guardar estudiante
            Log::info('Creando estudiante...');
            $estudiante = Estudiante::create([
                'codigo' => $codigoTemporal,
                'user_id' => $usuario->id,
                'primer_nombre' => $validated['primer_nombre'],
                'segundo_nombre' => $validated['segundo_nombre'],
                'primer_apellido' => $validated['primer_apellido'],
                'segundo_apellido' => $validated['segundo_apellido'],
                'sexo' => $validated['sexo'],
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'centro_educativo' => $validated['codigo'], // Usar el código correcto
                'nie' => $validated['nie'],
                'telefono_estudiante' => $validated['telefono_estudiante'],
                'telefono_casa' => $validated['telefono_casa'],
                'email' => $validated['email'],
                'direccion_id' => $direccion->id,
                'nivel_educativo' => $validated['nivel_educativo'],
                'aprobado' => false, // Aspirante por defecto
            ]);
            Log::info('✅ Estudiante creado', ['estudiante_id' => $estudiante->id]);

            // Responsable 1
            Log::info('Creando responsable 1...');
            $responsable = Responsable::create([
                'dui' => $validated['dui_responsable_1'],
                'codigo_estudiante' => $codigoTemporal,
                'nombres_responsable' => $validated['nombres_responsable_1'],
                'apellidos_responsable' => $validated['apellidos_responsable_1'],
                'email_responsable' => $validated['email_responsable_1'] ?? null,
                'telefono_responsable' => $validated['telefono_responsable_1'],
                'tipo_parentesco' => $validated['tipo_parentesco_1'],
                'otro_parentesco' => $validated['tipo_parentesco_1'] === 'Otro' ? $validated['otro_parentesco_1'] : null,
            ]);
            Log::info('✅ Responsable 1 creado', ['responsable_id' => $responsable->id]);

            // Responsable 2
            $tieneSegundoResponsable =
                !empty($validated['dui_responsable_2']) &&
                !empty($validated['nombres_responsable_2']) &&
                !empty($validated['apellidos_responsable_2']) &&
                !empty($validated['telefono_responsable_2']) &&
                !empty($validated['tipo_parentesco_2']);

            if ($tieneSegundoResponsable) {
                Log::info('Creando responsable 2...');
                Responsable::create([
                    'dui' => $validated['dui_responsable_2'],
                    'codigo_estudiante' => $codigoTemporal,
                    'nombres_responsable' => $validated['nombres_responsable_2'],
                    'apellidos_responsable' => $validated['apellidos_responsable_2'],
                    'email_responsable' => $validated['email_responsable_2'] ?? null,
                    'telefono_responsable' => $validated['telefono_responsable_2'],
                    'tipo_parentesco' => $validated['tipo_parentesco_2'],
                    'otro_parentesco' => $validated['tipo_parentesco_2'] === 'Otro' ? $validated['otro_parentesco_2'] : null,
                ]);
                Log::info('✅ Responsable 2 creado');
            } else {
                Log::info('ℹ️ Sin responsable 2');
            }

            Log::info('Enviando notificación por email...');
            $usuario->notify(new UserCredentialsNotification($passwordTemporal));
            Log::info('✅ Notificación enviada');

            Log::info('=== PROCESO COMPLETADO EXITOSAMENTE ===');
            return response()->json([
                'message' => 'Solicitud registrada exitosamente',
                'estudiante' => [
                    'codigo' => $estudiante->codigo,
                    'primer_nombre' => $estudiante->primer_nombre,
                    'primer_apellido' => $estudiante->primer_apellido,
                    'email' => $estudiante->email,
                ],
                'responsable' => [
                    'id' => $responsable->id,
                    'nombres_responsable' => $responsable->nombres_responsable,
                    'apellidos_responsable' => $responsable->apellidos_responsable,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Personalizar mensajes de error para ser más amigables
            $friendlyErrors = [];
            foreach ($e->errors() as $field => $messages) {
                $friendlyMessages = [];
                foreach ($messages as $message) {
                    // PRIORIDAD 1: Errores de duplicación (unique, taken)
                    if (
                        str_contains($message, 'unique') ||
                        str_contains($message, 'The nie has already been taken') ||
                        str_contains($message, 'The email has already been taken') ||
                        (str_contains($message, 'taken') && ($field === 'nie' || $field === 'email'))
                    ) {

                        if ($field === 'nie') {
                            $friendlyMessages[] = 'Este NIE ya está registrado en el sistema. Cada estudiante debe tener un NIE único.';
                        } elseif ($field === 'email') {
                            $friendlyMessages[] = 'Este correo electrónico ya está en uso. Por favor, usa una dirección de correo diferente.';
                        } else {
                            $friendlyMessages[] = 'Este valor ya está registrado en el sistema';
                        }

                        // PRIORIDAD 2: Campos requeridos
                    } elseif (str_contains($message, 'required')) {
                        $friendlyMessages[] = 'Este campo es obligatorio';

                        // PRIORIDAD 3: Validaciones específicas de campo
                    } elseif (str_contains($message, 'size') && str_contains($field, 'dui')) {
                        $friendlyMessages[] = 'El DUI debe tener exactamente 9 dígitos';
                    } elseif (str_contains($message, 'size') && str_contains($field, 'telefono')) {
                        $friendlyMessages[] = 'El teléfono debe tener exactamente 8 dígitos';
                    } elseif (str_contains($message, 'email') && !str_contains($message, 'unique') && !str_contains($message, 'taken')) {
                        // Error de formato de email (solo si NO es duplicación)
                        $friendlyMessages[] = 'El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com';
                    } elseif (str_contains($message, 'date')) {
                        $friendlyMessages[] = 'La fecha ingresada no es válida';
                    } elseif (str_contains($message, 'exists')) {
                        $friendlyMessages[] = 'El valor seleccionado no es válido';

                        // PRIORIDAD 4: Validaciones generales (min, max, etc.)
                    } elseif (str_contains($message, 'min')) {
                        $friendlyMessages[] = 'Este campo es demasiado corto';
                    } elseif (str_contains($message, 'max')) {
                        $friendlyMessages[] = 'Este campo es demasiado largo';

                        // PRIORIDAD 5: Usar método de traducción para casos no cubiertos
                    } else {
                        $translatedMessage = $this->translateCommonErrors($message, $field);
                        $friendlyMessages[] = $translatedMessage;
                    }
                }
                $friendlyErrors[$field] = $friendlyMessages;
            }

            return response()->json([
                'message' => 'Hay errores en el formulario que deben corregirse',
                'errors' => $friendlyErrors,
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en admisión: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'message' => 'Error interno del servidor',
                'error' => 'No se pudo procesar la solicitud de admisión'
            ], 500);
        }
    }

    /*
     *  Muestra el formulario de admisión
     */
    public function create(): Response
    {
        // Obtener departamentos y convertir IDs a string
        $departamentos = Departamento::select('id', 'nombre_departamento')
            ->orderBy('nombre_departamento')
            ->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'nombre_departamento' => $d->nombre_departamento,
            ]);

        // Obtener todos los municipios y convertir IDs a string
        $municipios = Municipio::select('id', 'nombre_municipio', 'id_departamento')
            ->orderBy('nombre_municipio')
            ->get()
            ->map(fn($m) => [
                'id' => (string) $m->id,
                'nombre_municipio' => $m->nombre_municipio,
                'id_departamento' => (string) $m->id_departamento,
            ]);

        // Obtener todos los distritos y convertir IDs a string
        $distritos = Distrito::select('id', 'nombre_distrito', 'id_municipio')
            ->orderBy('nombre_distrito')
            ->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'nombre_distrito' => $d->nombre_distrito,
                'id_municipio' => (string) $d->id_municipio,
            ]);

        return Inertia::render('admission/admission-register', [
            'departamentos' => $departamentos,
            'municipios' => $municipios,
            'distritos' => $distritos,
            'centros_educativos' => CentroEducativo::all(),
            'niveles_educativos' => NivelEducativo::all(),
        ]);
    }

    /**
     * Traducir errores comunes de Laravel al español
     */
    private function translateCommonErrors(string $message, string $field): string
    {
        // Convertir a minúsculas para comparaciones más robustas
        $lowerMessage = strtolower($message);

        // Errores específicos de duplicación - múltiples variantes
        if (
            str_contains($lowerMessage, 'has already been taken') ||
            str_contains($lowerMessage, 'already exists') ||
            str_contains($lowerMessage, 'duplicate') ||
            str_contains($message, 'unique')
        ) {

            if ($field === 'nie') {
                return 'Este NIE ya está registrado en el sistema. Cada estudiante debe tener un NIE único.';
            } elseif ($field === 'email') {
                return 'Este correo electrónico ya está en uso. Por favor, usa una dirección de correo diferente.';
            }
            return 'Este valor ya está registrado en el sistema';
        }

        // Errores de validación comunes
        if (str_contains($lowerMessage, 'validation.required') || str_contains($lowerMessage, 'required')) {
            return 'Este campo es obligatorio';
        }

        if (
            str_contains($lowerMessage, 'validation.email') ||
            (str_contains($lowerMessage, 'email') && !str_contains($lowerMessage, 'taken') && !str_contains($lowerMessage, 'unique'))
        ) {
            return 'El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com';
        }

        if (str_contains($lowerMessage, 'validation.size') || str_contains($lowerMessage, 'size')) {
            if (str_contains($field, 'dui')) {
                return 'El DUI debe tener exactamente 9 dígitos';
            } elseif (str_contains($field, 'telefono')) {
                return 'El teléfono debe tener exactamente 8 dígitos';
            }
            return 'El tamaño del campo no es válido';
        }

        if (str_contains($lowerMessage, 'validation.min') || str_contains($lowerMessage, 'minimum')) {
            return 'Este campo es demasiado corto';
        }

        if (str_contains($lowerMessage, 'validation.max') || str_contains($lowerMessage, 'maximum')) {
            return 'Este campo es demasiado largo';
        }

        if (str_contains($lowerMessage, 'validation.integer') || str_contains($lowerMessage, 'integer')) {
            return 'Este campo debe ser un número entero';
        }

        if (str_contains($lowerMessage, 'validation.string')) {
            return 'Este campo debe ser un texto válido';
        }

        if (str_contains($lowerMessage, 'validation.exists') || str_contains($lowerMessage, 'exists')) {
            return 'El valor seleccionado no es válido';
        }

        if (str_contains($lowerMessage, 'validation.date') || str_contains($lowerMessage, 'date')) {
            return 'La fecha ingresada no es válida';
        }

        // Si no coincide con ningún patrón conocido, devolver el mensaje original
        return $message;
    }
}
