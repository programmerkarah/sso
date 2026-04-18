<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('admin_verified_at')->nullable()->after('email_verified_at');
            $table->foreignId('admin_verified_by')
                ->nullable()
                ->after('admin_verified_at')
                ->constrained('users')
                ->nullOnDelete();
        });

        DB::table('users')
            ->whereNull('admin_verified_at')
            ->update([
                'admin_verified_at' => now(),
                'admin_verified_by' => null,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('admin_verified_by');
            $table->dropColumn('admin_verified_at');
        });
    }
};
