<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;

class EstudianteController extends Controller
{
    public function generatePermanentIds(Request $request)
    {
        $request->validate([
            'student_ids' => ['required', 'array'],
            'student_ids.*' => ['integer', 'exists:estudiantes,user_id'],
        ]);

        $students = Estudiante::whereIn('user_id', $request->student_ids)->get();

        $emailsToCreate = [];

        foreach ($students as $student) {
            // Generate permanent ID
            $permanentId = 'P' . date('Y') . '-' . str_pad($student->user_id, 4, '0', STR_PAD_LEFT);

            // Update student
            $student->codigo = $permanentId;
            $student->aprobado = true;
            $student->save();

            // Update user status
            $student->user->status = 'active';
            $student->user->save();

            $emailsToCreate[] = $student->email;
        }

        return response()->json(['emails_to_create' => $emailsToCreate]);
    }
}
