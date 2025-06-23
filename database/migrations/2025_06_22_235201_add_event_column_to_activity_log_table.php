<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddEventColumnToActivityLogTable extends Migration
{
    /**
     * Adds a nullable 'event' column to the activity log table.
     *
     * The new column is a string and is positioned after the 'subject_type' column. The table and database connection are determined by the 'activitylog' configuration.
     */
    public function up()
    {
        Schema::connection(config('activitylog.database_connection'))->table(config('activitylog.table_name'), function (Blueprint $table) {
            $table->string('event')->nullable()->after('subject_type');
        });
    }

    /**
     * Reverts the migration by removing the 'event' column from the activity log table.
     */
    public function down()
    {
        Schema::connection(config('activitylog.database_connection'))->table(config('activitylog.table_name'), function (Blueprint $table) {
            $table->dropColumn('event');
        });
    }
}
