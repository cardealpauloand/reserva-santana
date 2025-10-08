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
        Schema::table('order_items', function (Blueprint $table) {
            // Add product_name for API compatibility
            // This is denormalized data to avoid joins when listing orders
            $table->text('product_name')->nullable()->after('product_id');

            // Rename unit_price to price_at_purchase for Supabase compatibility
            $table->renameColumn('unit_price', 'price_at_purchase');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->renameColumn('price_at_purchase', 'unit_price');
            $table->dropColumn('product_name');
        });
    }
};
