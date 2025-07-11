<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as CommandAlias;

class CleanExpiredRoles extends Command
{
    protected $signature = 'roles:clean-expired';
    protected $description = 'Elimina roles expirados de todos los usuarios';

    public function handle(): int
    {
        $this->info('Iniciando limpieza de roles expirados...');

        $users = User::all();
        $count = 0;

        foreach ($users as $user) {
            $user->clearExpiredRoles();
            $count++;
        }

        $this->info("Se han procesado $count usuarios.");
        return CommandAlias::SUCCESS;
    }
}
