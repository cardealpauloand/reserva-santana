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
        // Rename old warehouses table for backup
        DB::statement('ALTER TABLE IF EXISTS warehouses RENAME TO warehouses_old');

        // Rename old addresses table for backup
        DB::statement('ALTER TABLE IF EXISTS addresses RENAME TO addresses_old');

        // Drop the address_type enum if it exists
        DB::statement('DROP TYPE IF EXISTS address_type CASCADE');

        // Recreate addresses table with Supabase-compatible schema
        Schema::create('addresses', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('name');
            $table->text('zip_code');
            $table->text('street');
            $table->text('number');
            $table->text('complement')->nullable();
            $table->text('neighborhood');
            $table->text('city');
            $table->text('state');
            $table->boolean('is_default')->default(false);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Create trigger for automatic timestamp updates
        DB::unprepared("
            CREATE OR REPLACE FUNCTION update_addresses_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at := CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER addresses_update_timestamp
            BEFORE UPDATE ON addresses
            FOR EACH ROW
            EXECUTE FUNCTION update_addresses_updated_at();
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop trigger and function
        DB::unprepared("
            DROP TRIGGER IF EXISTS addresses_update_timestamp ON addresses;
            DROP FUNCTION IF EXISTS update_addresses_updated_at();
        ");

        Schema::dropIfExists('addresses');

        // Recreate original schema (simplified version)
        DB::statement("CREATE TYPE address_type AS ENUM ('shipping', 'billing')");

        Schema::create('addresses', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('street', 255);
            $table->string('number', 50)->nullable();
            $table->string('complement', 255)->nullable();
            $table->string('district', 255)->nullable();
            $table->string('city', 255);
            $table->string('state', 50);
            $table->string('zip', 20);
            $table->string('country', 2)->default('BR');
            $table->boolean('is_default')->default(false);
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        DB::statement('ALTER TABLE addresses ADD COLUMN type address_type NOT NULL');

        Schema::create('warehouses', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->foreignId('address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
    }
};
