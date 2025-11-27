<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        if (!Schema::hasColumn('addresses', 'phone')) {
            Schema::table('addresses', function (Blueprint $table) {
                $table->text('phone')->nullable()->after('name');
            });
        }
    }

    
    public function down(): void
    {
        if (Schema::hasColumn('addresses', 'phone')) {
            Schema::table('addresses', function (Blueprint $table) {
                $table->dropColumn('phone');
            });
        }
    }
};
