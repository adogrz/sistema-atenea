<?php

namespace App\Observers;

use App\Models\InscripcionOlimpiada;
use App\Models\BitacoraInscripcion;
use Illuminate\Support\Facades\Auth;

/**
 * Registra acciones en la bitácora:
 * - created      -> 'inscripcion'
 * - deleted      -> 'desinscripcion' (incluye soft delete)
 * - forceDeleted -> 'desinscripcion'
 */
class InscripcionOlimpiadaObserver
{
    /**
     * Registra la creación de una inscripción.
     */
    public function created(InscripcionOlimpiada $inscripcion): void
    {
        $inscripcion->bitacoras()->create([
            'usuario_id' => Auth::id(), // puede ser null
            'accion'     => BitacoraInscripcion::ACCION_INSCRIPCION,
        ]);
    }

    /**
     * Registra la eliminación de una inscripción.
     */
    public function deleted(InscripcionOlimpiada $inscripcion): void
    {
        $inscripcion->bitacoras()->create([
            'usuario_id' => Auth::id(),
            'accion'     => BitacoraInscripcion::ACCION_DESINSCRIPCION,
        ]);
    }

    /**
     * Registra la eliminación forzada de una inscripción.
     */
    public function forceDeleted(InscripcionOlimpiada $inscripcion): void
    {
        $inscripcion->bitacoras()->create([
            'usuario_id' => Auth::id(),
            'accion'     => BitacoraInscripcion::ACCION_DESINSCRIPCION,
        ]);
    }
}