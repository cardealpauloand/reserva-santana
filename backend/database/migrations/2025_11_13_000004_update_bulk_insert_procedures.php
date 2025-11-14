<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE OR REPLACE PROCEDURE insert_products_bulk(
    IN products_data JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    product_item JSONB;
    total_inserted INT := 0;
BEGIN
    FOR product_item IN SELECT jsonb_array_elements(products_data)
    LOOP
        INSERT INTO products (
            name,
            description,
            sku,
            price,
            active,
            created_at,
            updated_at
        ) VALUES (
            product_item->>'name',
            product_item->>'description',
            product_item->>'sku',
            (product_item->>'price')::numeric(12, 2),
            COALESCE((product_item->>'active')::boolean, true),
            NOW(),
            NOW()
        )
        ON CONFLICT (sku) DO NOTHING;

        IF FOUND THEN
            total_inserted := total_inserted + 1;
        END IF;
    END LOOP;

    RAISE NOTICE 'Bulk insert completed. % products inserted.', total_inserted;
END;
$$;

CREATE OR REPLACE PROCEDURE insert_categories_bulk(
    IN categories_data JSONB,
    IN group_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    category_item JSONB;
    total_inserted INT := 0;
BEGIN
    FOR category_item IN SELECT jsonb_array_elements(categories_data)
    LOOP
        INSERT INTO categories (
            name,
            description,
            slug,
            group_id,
            active,
            created_at,
            updated_at
        ) VALUES (
            category_item->>'name',
            category_item->>'description',
            COALESCE(category_item->>'slug', LOWER(REPLACE(category_item->>'name', ' ', '-'))),
            group_id,
            COALESCE((category_item->>'active')::boolean, true),
            NOW(),
            NOW()
        )
        ON CONFLICT (name, group_id) DO NOTHING;

        IF FOUND THEN
            total_inserted := total_inserted + 1;
        END IF;
    END LOOP;

    RAISE NOTICE 'Category bulk insert completed. % categories inserted.', total_inserted;
END;
$$;
SQL
        );
    }

   
    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS insert_products_bulk(JSONB);
DROP PROCEDURE IF EXISTS insert_categories_bulk(JSONB, UUID);
SQL
        );
    }
};
