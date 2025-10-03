<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug', 255)->nullable()->after('name');
            $table->string('type', 100)->nullable()->after('slug');
            $table->unique('slug');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('slug', 255)->nullable()->after('name');
            $table->string('origin', 255)->nullable()->after('slug');
            $table->string('type', 100)->nullable()->after('origin');
            $table->decimal('original_price', 12, 2)->nullable()->after('price');
            $table->unsignedTinyInteger('rating')->nullable()->after('original_price');
            $table->string('volume', 50)->nullable()->after('rating');
            $table->string('alcohol', 50)->nullable()->after('volume');
            $table->string('temperature', 50)->nullable()->after('alcohol');
            $table->unique('slug');
        });

        DB::table('categories')->select('id', 'name')->get()->each(function ($category): void {
            $slug = Str::slug($category->name);

            if (empty($slug)) {
                $slug = (string) Str::uuid();
            }

            DB::table('categories')->where('id', $category->id)->update(['slug' => $slug]);
        });

        DB::table('products')->select('id', 'name')->get()->each(function ($product): void {
            $slug = Str::slug($product->name);

            if (empty($slug)) {
                $slug = (string) Str::uuid();
            }

            DB::table('products')->where('id', $product->id)->update(['slug' => $slug]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique('products_slug_unique');
            $table->dropColumn([
                'slug',
                'origin',
                'type',
                'original_price',
                'rating',
                'volume',
                'alcohol',
                'temperature',
            ]);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique('categories_slug_unique');
            $table->dropColumn(['slug', 'type']);
        });
    }
};
