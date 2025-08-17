<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use App\Traits\HasTemporaryRoles;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasTemporaryRoles, SoftDeletes {
        HasTemporaryRoles::roles insteadof HasRoles;
    }

    protected $with = ['roles', 'permissions', 'areas'];
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'sede_name',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Devuelve el estudiante asociado al usuario
     * @return Estudiante
     */
    public function estudiante()
    {
        return $this->hasOne(Estudiante::class, 'user_id', 'id');
    }

    /**
     * Devuelve la descripcion de la sede del usuario
     * @return BelongsTo
     */
    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class, 'sede_name', 'name');
    }

    /**
     * Áreas académicas a las que pertenece el usuario
     * @return BelongsToMany
     */
    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'user_area')->withPivot('is_primary');
    }

    /**
     * Devuelve el área principal del usuario, si existe.
     * @return Area|null
     */
    public function primaryArea(): ?Area
    {
        return $this->areas()->wherePivot('is_primary', true)->first();
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'olimpiada_id');
    }

    public function fase()
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_id');
    }

    public function participante()
    {
        return $this->belongsTo(Estudiante::class, 'codigo_estudiante', 'codigo');
    }
}
