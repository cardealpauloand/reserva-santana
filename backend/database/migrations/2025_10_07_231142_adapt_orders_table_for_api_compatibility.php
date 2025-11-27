<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            
            
            $table->decimal('total', 12, 2)->nullable()->after('grand_total');

            
            
            $table->jsonb('shipping_address_data')->nullable()->after('shipping_address_id');
        });

        
        DB::unprepared("
            CREATE OR REPLACE FUNCTION sync_order_total()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.total := NEW.grand_total;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER orders_sync_total
            BEFORE INSERT OR UPDATE ON orders
            FOR EACH ROW
            EXECUTE FUNCTION sync_order_total();
        ");
    }

    
    public function down(): void
    {
        DB::unprepared("
            DROP TRIGGER IF EXISTS orders_sync_total ON orders;
            DROP FUNCTION IF EXISTS sync_order_total();
        ");

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['total', 'shipping_address_data']);
        });
    }
};
