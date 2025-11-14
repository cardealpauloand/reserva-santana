<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  
    public function up(): void
    {
        DB::unprepared("
            CREATE OR REPLACE FUNCTION audit_product_price_change()
            RETURNS TRIGGER AS $$
            BEGIN
                -- If the price was actually changed, record it in the history table
                IF OLD.price IS DISTINCT FROM NEW.price THEN
                    INSERT INTO product_price_history (
                        product_id, old_price, new_price, changed_at, created_at, updated_at
                    ) VALUES (
                        NEW.id, OLD.price, NEW.price, NOW(), NOW(), NOW()
                    );
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Create trigger that fires the function on product price updates
            CREATE TRIGGER product_price_audit
            AFTER UPDATE ON products
            FOR EACH ROW
            EXECUTE FUNCTION audit_product_price_change();
        ");
    }

   
    public function down(): void
    {
        DB::unprepared("
            DROP TRIGGER IF EXISTS product_price_audit ON products;
            DROP FUNCTION IF EXISTS audit_product_price_change();
        ");
    }
};
