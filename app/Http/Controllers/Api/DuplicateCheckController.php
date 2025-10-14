<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DuplicateCheckController extends Controller
{
    /**
     * Verificar si un campo ya existe en la base de datos
     */
    public function checkDuplicate(Request $request): JsonResponse
    {
        $request->validate([
            'field' => 'required|in:email,nie',
            'value' => 'required|string|max:255',
        ]);

        $field = $request->input('field');
        $value = trim($request->input('value'));

        // Validaciones adicionales específicas por campo
        if ($field === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'exists' => false,
                'field' => $field,
                'value' => $value,
                'error' => 'Email inválido'
            ], 422);
        }

        if ($field === 'nie' && !preg_match('/^\d{7,10}$/', $value)) {
            return response()->json([
                'exists' => false,
                'field' => $field,
                'value' => $value,
                'error' => 'NIE debe tener entre 7 y 10 dígitos'
            ], 422);
        }

        try {
            $exists = false;

            // Lógica diferente según el campo
            if ($field === 'email') {
                // Para email: verificar en la tabla users (todos los usuarios del sistema)
                $exists = User::where('email', $value)->exists();
            } elseif ($field === 'nie') {
                // Para NIE: verificar solo en la tabla estudiantes (solo estudiantes)
                $exists = Estudiante::where('nie', $value)->exists();
            }

            return response()->json([
                'exists' => $exists,
                'field' => $field,
                'value' => $value,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error checking duplicate', [
                'field' => $field,
                'value' => $value,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'exists' => false,
                'field' => $field,
                'value' => $value,
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }
}
