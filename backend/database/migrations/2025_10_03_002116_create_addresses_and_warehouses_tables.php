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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('addresses');
    }
};
