<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Log;

/**
 * ClaimService
 *
 * Gestiona el bloqueo (claim) de una inscripción para calificación,
 * evitando ediciones concurrentes. Usa un TTL renovable (heartbeat).
 *
 * Tabla esperada: claims_calificacion
 * - id (pk)
 * - inscripcion_id (unique)
 * - calificador_id
 * - locked_until (timestamp) // expiración del claim
 * - created_at, updated_at
 *
 * Si tu migración usa otros nombres (p. ej. user_id en vez de calificador_id),
 * ajusta las constantes de columna aquí mismo.
 */
class ClaimService
{
    private const TABLE = 'claims_calificacion';
    private const COL_INSCRIPCION = 'inscripcion_id';
    private const COL_CALIFICADOR = 'calificador_id';
    private const COL_LOCKED_UNTIL = 'locked_until';

    /** TTL por defecto en segundos (10 min) */
    private int $ttlSeconds;

    public function __construct(int $ttlSeconds = 600)
    {
        $this->ttlSeconds = $ttlSeconds;
    }

    /**
     * Intenta adquirir el claim. Si ya lo tiene el mismo calificador y no ha expirado,
     * lo renueva. Si está expirado (o libre), lo adquiere.
     */
    public function acquireOrRenew(int $inscripcionId, int $calificadorId): bool
    {
        $now = Carbon::now();
        $newExpiry = $now->clone()->addSeconds($this->ttlSeconds);

        return DB::transaction(function () use ($inscripcionId, $calificadorId, $now, $newExpiry) {
            /** @var Builder $q */
            $q = DB::table(self::TABLE)->where(self::COL_INSCRIPCION, $inscripcionId);
            $row = $q->lockForUpdate()->first();

            if (!$row) {
                DB::table(self::TABLE)->insert([
                    self::COL_INSCRIPCION => $inscripcionId,
                    self::COL_CALIFICADOR => $calificadorId,
                    self::COL_LOCKED_UNTIL => $newExpiry,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                return true;
            }

            $lockedUntil = Carbon::parse($row->{self::COL_LOCKED_UNTIL});
            $isExpired = $lockedUntil->lt($now);

            if ($row->{self::COL_CALIFICADOR} == $calificadorId || $isExpired) {
                // Renueva o toma si estaba expirado
                $q->update([
                    self::COL_CALIFICADOR => $calificadorId,
                    self::COL_LOCKED_UNTIL => $newExpiry,
                    'updated_at' => $now,
                ]);
                return true;
            }

            // En uso por otro calificador y no expirado
            return false;
        });
    }

    /** Renueva el claim si lo tiene el mismo calificador (latido) */
    public function heartbeat(int $inscripcionId, int $calificadorId): bool
    {
        $now = Carbon::now();
        $newExpiry = $now->clone()->addSeconds($this->ttlSeconds);

        return (bool) DB::table(self::TABLE)
            ->where(self::COL_INSCRIPCION, $inscripcionId)
            ->where(self::COL_CALIFICADOR, $calificadorId)
            ->where(self::COL_LOCKED_UNTIL, '>', $now)
            ->update([
                self::COL_LOCKED_UNTIL => $newExpiry,
                'updated_at' => $now,
            ]);
    }

    /** Lanza excepción si el claim no está en manos del calificador o si expiró */
    public function ensureHeldByOrFail(int $inscripcionId, int $calificadorId): void
    {
        $now = Carbon::now();
        $row = DB::table(self::TABLE)->where(self::COL_INSCRIPCION, $inscripcionId)->first();

        if (!$row) {
            abort(409, 'No existe un claim activo para esta inscripción.');
        }

        if ((int) $row->{self::COL_CALIFICADOR} !== $calificadorId) {
            abort(423, 'Otro calificador posee el claim actualmente.');
        }

        if (Carbon::parse($row->{self::COL_LOCKED_UNTIL})->lte($now)) {
            abort(409, 'El claim expiró. Vuelve a abrir la evaluación para renovar el bloqueo.');
        }
    }

    /** Libera el claim si lo posee el calificador (idempotente) */
    public function release(int $inscripcionId, int $calificadorId): void
    {
        DB::table(self::TABLE)
            ->where(self::COL_INSCRIPCION, $inscripcionId)
            ->where(self::COL_CALIFICADOR, $calificadorId)
            ->delete();
    }

    /** Filtro para inscripciones no reclamadas por otros */
    public static function scopeNotClaimedByOthers(
        Builder $q,
        string $inscripcionPkColumn,
        int $userId,
        ?Carbon $now = null
    ): void {
        $now ??= now();
        $q->select(DB::raw(1))
            ->from(self::TABLE . ' as c')
            ->whereColumn('c.' . self::COL_INSCRIPCION, $inscripcionPkColumn)
            ->where('c.' . self::COL_CALIFICADOR, '<>', $userId)
            ->where('c.' . self::COL_LOCKED_UNTIL, '>', $now);
    }
}
