<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Direccion extends Model
{
    use HasFactory;
    protected $table = 'direcciones';

    protected $fillable = [
        'colonia',
        'calle',
        'numero_casa',
        'punto_referencia',
        'direccion_completa',
        'distrito_id',
    ];

    /**
     * Relación con el distrito
     */
    public function distrito(): BelongsTo
    {
        return $this->belongsTo(Distrito::class);
    }

    /**
     * Relación con estudiantes (una dirección puede ser usada por múltiples estudiantes)
     */
    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class);
    }

    /**
     * Accessor para obtener la dirección completa formateada
     */
    public function getDireccionFormateadaAttribute(): string
    {
        $parts = array_filter([
            $this->colonia,
            $this->calle,
            $this->numero_casa,
            $this->punto_referencia,
        ]);

        $direccion = implode(', ', $parts);

        if ($this->direccion_completa) {
            $direccion .= ' - ' . $this->direccion_completa;
        }

        return $direccion;
    }

    /**
     * Scope para buscar direcciones similares (para evitar duplicados)
     */
    public function scopeSimilar($query, $colonia, $calle, $numero_casa, $distrito_id)
    {
        return $query->where('colonia', $colonia)
            ->where('calle', $calle)
            ->where('numero_casa', $numero_casa)
            ->where('distrito_id', $distrito_id);
    }
}
