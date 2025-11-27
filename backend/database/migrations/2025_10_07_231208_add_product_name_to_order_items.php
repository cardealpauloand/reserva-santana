<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            
            
            $table->text('product_name')->nullable()->after('product_id');

            
            $table->renameColumn('unit_price', 'price_at_purchase');
        });
    }

    
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->renameColumn('price_at_purchase', 'unit_price');
            $table->dropColumn('product_name');
        });
    }
};
