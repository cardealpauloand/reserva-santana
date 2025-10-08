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
        // Rename old user_roles table if exists
        DB::statement('ALTER TABLE IF EXISTS user_roles RENAME TO user_roles_old');

        // Create enum type for roles
        DB::statement("CREATE TYPE app_role AS ENUM ('admin', 'user')");

        // Create new user_roles table with Supabase-compatible schema
        Schema::create('user_roles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Add role column with enum type
        DB::statement('ALTER TABLE user_roles ADD COLUMN role app_role NOT NULL');

        // Add unique constraint to prevent duplicate role assignments
        DB::statement('ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_roles');
        DB::statement('DROP TYPE IF EXISTS app_role');
    }
};
