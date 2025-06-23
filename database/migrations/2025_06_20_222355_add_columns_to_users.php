<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds 'role_name' and 'sede_name' string columns to the 'users' table.
     *
     * The 'role_name' column is added after the 'id' column, and the 'sede_name' column is added after 'role_name'.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role_name')->after('id');
            $table->string('sede_name')->after('role_name');
        });
    }

    /**
     * Removes the 'role_name' and 'sede_name' columns from the 'users' table, reverting the changes made by the migration.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role_name');
            $table->dropColumn('sede_name');
        });
    }
};
