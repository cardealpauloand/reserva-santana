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
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        DB::statement(<<<'SQL'
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('draft','pending_payment','paid','picking','shipped','delivered','canceled','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
SQL);

        DB::statement(<<<'SQL'
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded','canceled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
SQL);

        DB::statement(<<<'SQL'
DO $$ BEGIN
  CREATE TYPE shipment_status AS ENUM ('ready','shipped','delivered','exception','returned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
SQL);

        DB::statement(<<<'SQL'
DO $$ BEGIN
  CREATE TYPE address_type AS ENUM ('shipping','billing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
SQL);

        DB::statement(<<<'SQL'
DO $$ BEGIN
  CREATE TYPE token_type AS ENUM ('refresh','api');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TYPE IF EXISTS token_type');
        DB::statement('DROP TYPE IF EXISTS address_type');
        DB::statement('DROP TYPE IF EXISTS shipment_status');
        DB::statement('DROP TYPE IF EXISTS payment_status');
        DB::statement('DROP TYPE IF EXISTS order_status');

        DB::statement('DROP EXTENSION IF EXISTS "uuid-ossp"');
        DB::statement('DROP EXTENSION IF EXISTS pg_trgm');
    }
};
