<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'password_change_required')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->boolean('password_change_required')->default(false)->after('password');
            });
        }

        if (! Schema::hasColumn('users', 'previous_password')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->string('previous_password')->nullable()->after('password_change_required');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $columnsToDrop = [];

            if (Schema::hasColumn('users', 'password_change_required')) {
                $columnsToDrop[] = 'password_change_required';
            }

            if (Schema::hasColumn('users', 'previous_password')) {
                $columnsToDrop[] = 'previous_password';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
