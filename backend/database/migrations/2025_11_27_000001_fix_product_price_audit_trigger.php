<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update trigger function to remove 'changed_at' column which doesn't exist
        DB::unprepared("
            CREATE OR REPLACE FUNCTION audit_product_price_change()
            RETURNS TRIGGER AS $$
            BEGIN
                -- If the price was actually changed, record it in the history table
                IF OLD.price IS DISTINCT FROM NEW.price THEN
                    INSERT INTO product_price_history (
                        product_id, old_price, new_price, created_at, updated_at
                    ) VALUES (
                        NEW.id, OLD.price, NEW.price, NOW(), NOW()
                    );
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to the previous version (which was broken, but this is the correct revert behavior)
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
        ");
    }
};
