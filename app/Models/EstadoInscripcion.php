<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

/**
 * @property int $id
 * @property string $nombre
 * @property string|null $descripcion
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * ──────────────── Métodos personalizados ────────────────
 * @method static Builder activos()        // Inscrito
 * @method static Builder retirados()      // Retirado
 * @method static Builder anulados()       // Anulado
 * @method static Builder preinscritos()   // Preinscrito
 */
class EstadoInscripcion extends Model
{
    protected $table = 'estados_inscripciones';

    protected $fillable = ['nombre', 'slug', 'descripcion'];

    public $timestamps = true;

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('nombre', 'Inscrito');
    }

    public function scopeRetirados(Builder $query): Builder
    {
        return $query->where('nombre', 'Retirado');
    }

    public function scopeAnulados(Builder $query): Builder
    {
        return $query->where('nombre', 'Anulado');
    }

    public function scopePreinscritos(Builder $query): Builder
    {
        return $query->where('nombre', 'Preinscrito');
    }

    public function scopeSlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function esActivo(): bool
    {
        return $this->nombre === 'Inscrito';
    }

    public function esRetirado(): bool
    {
        return $this->nombre === 'Retirado';
    }

    public function esAnulado(): bool
    {
        return $this->nombre === 'Anulado';
    }

    public function esPreinscrito(): bool
    {
        return $this->nombre === 'Preinscrito';
    }
}
