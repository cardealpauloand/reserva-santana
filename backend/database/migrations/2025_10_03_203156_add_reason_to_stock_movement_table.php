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
        if (Schema::hasColumn('stock_movement', 'reason')) {
            return;
        }

        Schema::table('stock_movement', function (Blueprint $table) {
            $table->string('reason', 255)->nullable()->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('stock_movement', 'reason')) {
            return;
        }

        Schema::table('stock_movement', function (Blueprint $table) {
            $table->dropColumn('reason');
        });
    }
};
