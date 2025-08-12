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

use App\Notifications\UserCredentialsNotification;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;

use Inertia\Inertia;
use Inertia\Response;

class AdmisionController extends Controller
{

    /*
     * Método de registro de estudiantes del proceso de admisión
     */
    public function store(Request $request): JsonResponse
    {
        //dump($request);
        $validated = $request->validate([

            // Estudiante
            'primer_nombre' => 'required|string|max:50',
            'segundo_nombre' => 'nullable|string|max:50',
            'primer_apellido' => 'required|string|max:50',
            'segundo_apellido' => 'nullable|string|max:50',
            'sexo' => 'required|in:H,M',
            'fecha_nacimiento' => 'required|date',
            'centro_educativo' => 'required|exists:centros_educativos,nombre',
            'codigo' => 'required|exists:centros_educativos,codigo',
            'nie' => 'required|string|unique:estudiantes,nie',
            'telefono_casa' => 'nullable|string|size:8',
            'email' => 'required|email|unique:estudiantes,email',
            'direccion' => 'required|string|max:255',
            'distrito' => 'required|exists:distritos,id',
            'departamento' => 'required|string',
            'municipio' => 'required|string',
            'nivel_educativo' => 'required|string',

            // Responsable 1
            'dui_responsable_1' => 'required|string|size:9',
            'nombres_responsable_1' => 'required|string|max:100',
            'apellidos_responsable_1' => 'required|string|max:100',
            'email_responsable_1' => 'required|email',
            'telefono_responsable_1' => 'required|string|size:8',
            'tipo_parentesco_1' => 'required|in:Madre,Padre,Abuelo,Tio,Tutor legal',

            // Responsable 2 (opcional)
            'dui_responsable_2' => 'nullable|string|size:9',
            'nombres_responsable_2' => 'nullable|string|max:100',
            'apellidos_responsable_2' => 'nullable|string|max:100',
            'email_responsable_2' => 'nullable|email',
            'telefono_responsable_2' => 'nullable|string|size:8',
            'tipo_parentesco_2' => 'nullable|in:Madre,Padre,Abuelo,Tio,Tutor legal',
        ]);

        // Creación de passwordTemporal
        $passwordTemporal = bin2hex(random_bytes(6)); // genera 12 caracteres hexadecimales

        // Obtención de nivel educativo
        $nivelEducativo = NivelEducativo::where('codigo', $validated['nivel_educativo'])->first();

        // Buscar o crear usuario
        $usuario = User::firstOrCreate(
            ['email' => $validated['email']],          // condiciones de búsqueda
            [                                           // atributos para creación
                'name' => $validated['primer_nombre'] . ' ' . $validated['primer_apellido'],
                'password' => Hash::make($passwordTemporal),
                'role_name' => 'none',
                'sede_name' => $nivelEducativo->id_sede,
            ]
        );

        // Generación de codigo temporal
        $codigoTemporal = 'ASP-' . $validated['primer_apellido'][0] . '' . $validated['segundo_apellido'][0] . '' . substr($validated['nie'], -3) . '-' . strtoupper(substr(uniqid(), -3)); // Genera un identificador unico temporal

        // Guardar estudiante
        $estudiante = Estudiante::create([
            'codigo' => $codigoTemporal,
            'user_id' => $usuario->id,
            'primer_nombre' => $validated['primer_nombre'],
            'segundo_nombre' => $validated['segundo_nombre'],
            'primer_apellido' => $validated['primer_apellido'],
            'segundo_apellido' => $validated['segundo_apellido'],
            'sexo' => $validated['sexo'],
            'fecha_nacimiento' => $validated['fecha_nacimiento'],
            'centro_educativo' => $validated['codigo'], // ← aquí se guarda el valor de 'codigo'
            'nie' => $validated['nie'],
            'telefono_casa' => $validated['telefono_casa'],
            'email' => $validated['email'],
            'direccion' => $validated['direccion'],
            'distrito' => $validated['distrito'],
            'nivel_educativo' => $validated['nivel_educativo'],
        ]);

        // Responsable 1
        $responsable = Responsable::create([
            'dui' => $validated['dui_responsable_1'],
            'codigo_estudiante' => $codigoTemporal,
            'nombres_responsable' => $validated['nombres_responsable_1'],
            'apellidos_responsable' => $validated['apellidos_responsable_1'],
            'email_responsable' => $validated['email_responsable_1'],
            'telefono_responsable' => $validated['telefono_responsable_1'],
            'tipo_parentesco' => $validated['tipo_parentesco_1'],
        ]);

        // Responsable 2
        $tieneSegundoResponsable =
            !empty($validated['dui_responsable_2']) &&
            !empty($validated['nombres_responsable_2']) &&
            !empty($validated['apellidos_responsable_2']) &&
            !empty($validated['telefono_responsable_2']) &&
            !empty($validated['tipo_parentesco_2']);

        if ($tieneSegundoResponsable) {
            Responsable::create([
                'dui' => $validated['dui_responsable_2'],
                'codigo_estudiante' => $codigoTemporal,
                'nombres_responsable' => $validated['nombres_responsable_2'],
                'apellidos_responsable' => $validated['apellidos_responsable_2'],
                'email_responsable' => $validated['email_responsable_2'] ?? null, // opcional
                'telefono_responsable' => $validated['telefono_responsable_2'],
                'tipo_parentesco' => $validated['tipo_parentesco_2'],
            ]);
        }

        $usuario->syncRoles(['estudiante']);

        $usuario->notify(new UserCredentialsNotification($passwordTemporal));

        return response()->json([
            'message' => 'Solicitud registrada exitosamente',
            'estudiante' => $estudiante,
            'responsable' => $responsable,
        ], 201);
    }

    /*
     *  Muestra el formulario de admisión
     */
    public function create(): Response
    {
        $departamentos = Departamento::select('id', 'nombre_departamento')->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'nombre_departamento' => $d->nombre_departamento,
            ]);

        $municipios = Municipio::select('id', 'nombre_municipio', 'id_departamento')->get();
        $municipiosPorDepartamento = $municipios->groupBy('id_departamento')->map(function (Collection $items) {
            return $items->map(fn($m) => [
                'id' => (string) $m->id,
                'nombre_municipio' => $m->nombre_municipio,
            ]);
        });

        $distritos = Distrito::select('id', 'nombre_distrito', 'id_municipio')->get();
        $distritosPorMunicipio = $distritos->groupBy('id_municipio')->map(function (Collection $items) {
            return $items->map(fn($d) => [
                'id' => (string) $d->id,
                'nombre_distrito' => $d->nombre_distrito,
            ]);
        });

        return Inertia::render('admission/admission-register', [
            'departamentos' => $departamentos,
            'municipiosPorDepartamento' => $municipiosPorDepartamento,
            'distritosPorMunicipio' => $distritosPorMunicipio,
            'centrosEducativos' => CentroEducativo::all(),
            'nivelesEducativos' => NivelEducativo::all(),
        ]);
    }
}