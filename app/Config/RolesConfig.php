<?php

namespace App\Config;

class RolesConfig
{
    public static function getRolesRequiringArea(): array
    {
        return ['coordinador-area', 'mentor', 'instructor', 'calificador'];
    }

    public static function getProtectedRoles(): array
    {
        return ['jefe-medicina', 'jefe-psicologia'];
    }
}
