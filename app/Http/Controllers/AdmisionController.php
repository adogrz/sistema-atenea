<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use App\Models\Responsable;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdmisionController extends Controller
{

    public function store(Request $request): JsonResponse
    {
        dump($request);
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
            'telefono_estudiante' => 'required|string|size:8',
            'telefono_casa' => 'nullable|string|size:8',
            'email' => 'required|email|unique:estudiantes,email',
            'direccion' => 'required|string|max:255',
            'distrito' => 'required|exists:distritos,id',
            'departamento' => 'required|string',
            'municipio' => 'required|string',
            'nivel_educativo' => 'required|string',

            // Responsable
            'dui' => 'required|string|size:10|unique:responsables,dui',
            'nombres_responsable' => 'required|string|max:100',
            'apellidos_responsable' => 'required|string|max:100',
            'email_responsable' => 'nullable|email',
            'telefono_responsable' => 'required|string|size:8',
            'telefono_opcional' => 'required|string|size:8',
            'tipo_parentesco' => 'required|in:Madre,Padre,Abuelo,Tio,Tutor legal',
        ]);


        // Buscar o crear usuario
        $user = User::firstOrCreate(
            ['email' => $validated['email']],          // condiciones de búsqueda
            [                                           // atributos para creación
                'name' => $validated['primer_nombre'] . ' ' . $validated['primer_apellido'],
                'password' => Hash::make($request->password),
                'role_name' => 'none',
                'sede_name' => 'none',
            ]
        );


        // Generación de codigo temporal
        $fecha = now()->format('dm'); // Ej. '1407' para 14 de julio
        $codigoTemporal = 'ASP-' . $fecha . '-' . strtoupper(substr(uniqid(), -3)); // Genera un identificador unico temporal

        // Guardar estudiante
        $estudiante = Estudiante::create([
            'codigo' => $codigoTemporal,
            'user_id' => $user->id,
            'primer_nombre' => $validated['primer_nombre'],
            'segundo_nombre' => $validated['segundo_nombre'],
            'primer_apellido' => $validated['primer_apellido'],
            'segundo_apellido' => $validated['segundo_apellido'],
            'sexo' => $validated['sexo'],
            'fecha_nacimiento' => $validated['fecha_nacimiento'],
            'centro_educativo' => $validated['codigo'], // ← aquí se guarda el valor de 'codigo'
            'nie' => $validated['nie'],
            'telefono_estudiante' => $validated['telefono_estudiante'],
            'telefono_casa' => $validated['telefono_casa'],
            'email' => $validated['email'],
            'direccion' => $validated['direccion'],
            'distrito' => $validated['distrito'],
            'nivel_educativo' => $validated['nivel_educativo'],
        ]);

        // 👤 Guardar responsable
        $responsable = Responsable::create([
            'dui' => $validated['dui'],
            'codigo_estudiante' => $codigoTemporal,
            'nombres_responsable' => $validated['nombres_responsable'],
            'apellidos_responsable' => $validated['apellidos_responsable'],
            'email_responsable' => $validated['email_responsable'],
            'telefono_responsable' => $validated['telefono_responsable'],
            'telefono_opcional' => $validated['telefono_opcional'],
            'tipo_parentesco' => $validated['tipo_parentesco'],
        ]);

        return response()->json([
            'message' => 'Solicitud registrada exitosamente',
            'estudiante' => $estudiante,
            'responsable' => $responsable,
        ], 201);
    }
}