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
        // Create stored procedure for bulk insertion of products
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE insert_products_bulk(
                IN products_data JSONB
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                product_item JSONB;
                new_product_id UUID;
                total_inserted INT := 0;
            BEGIN
                -- Iterate over array of products in JSONB format
                FOR product_item IN SELECT jsonb_array_elements(products_data)
                LOOP
                    -- Generate new UUID for product
                    new_product_id := gen_random_uuid();

                    -- Insert product with provided data
                    INSERT INTO products (
                        id,
                        name,
                        description,
                        sku,
                        price,
                        active,
                        created_at,
                        updated_at
                    ) VALUES (
                        new_product_id,
                        product_item->>'name',
                        product_item->>'description',
                        product_item->>'sku',
                        (product_item->>'price')::numeric(12, 2),
                        COALESCE((product_item->>'active')::boolean, true),
                        NOW(),
                        NOW()
                    )
                    ON CONFLICT (sku) DO NOTHING;  -- Skip if SKU already exists

                    total_inserted := total_inserted + 1;
                END LOOP;

                -- Log the operation (optional, for audit purposes)
                RAISE NOTICE 'Bulk insert completed. % products processed.', total_inserted;
            END;
            $$;

            -- Alternative procedure for bulk insert of categories
            CREATE OR REPLACE PROCEDURE insert_categories_bulk(
                IN categories_data JSONB,
                IN group_id UUID DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                category_item JSONB;
                new_category_id UUID;
                total_inserted INT := 0;
            BEGIN
                -- Iterate over array of categories in JSONB format
                FOR category_item IN SELECT jsonb_array_elements(categories_data)
                LOOP
                    -- Generate new UUID for category
                    new_category_id := gen_random_uuid();

                    -- Insert category with provided data
                    INSERT INTO categories (
                        id,
                        name,
                        description,
                        slug,
                        group_id,
                        active,
                        created_at,
                        updated_at
                    ) VALUES (
                        new_category_id,
                        category_item->>'name',
                        category_item->>'description',
                        COALESCE(category_item->>'slug', LOWER(REPLACE(category_item->>'name', ' ', '-'))),
                        group_id,
                        COALESCE((category_item->>'active')::boolean, true),
                        NOW(),
                        NOW()
                    )
                    ON CONFLICT (name, group_id) DO NOTHING;  -- Skip if name already exists in group

                    total_inserted := total_inserted + 1;
                END LOOP;

                -- Log the operation (optional, for audit purposes)
                RAISE NOTICE 'Category bulk insert completed. % categories processed.', total_inserted;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("
            DROP PROCEDURE IF EXISTS insert_products_bulk(JSONB);
            DROP PROCEDURE IF EXISTS insert_categories_bulk(JSONB, UUID);
        ");
    }
};
