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
        Schema::table('orders', function (Blueprint $table) {
            // Add 'total' column as alias/computed from grand_total
            // This is for API compatibility with Supabase schema
            $table->decimal('total', 12, 2)->nullable()->after('grand_total');

            // Add shipping_address as JSONB for simple API responses
            // This complements the shipping_address_id foreign key
            $table->jsonb('shipping_address_data')->nullable()->after('shipping_address_id');
        });

        // Create a trigger to auto-sync total from grand_total
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

    /**
     * Reverse the migrations.
     */
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
