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
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('currency', 3)->default('BRL');
            $table->date('date')->nullable();
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->foreignId('billing_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('shipping_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('deleted_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
        });

        DB::statement("ALTER TABLE orders ADD COLUMN status order_status NOT NULL DEFAULT 'draft'");
        DB::statement('CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_order_status_created_at ON orders(status, created_at)');

        Schema::create('order_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2);
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->index('order_id', 'idx_order_items_order');
        });

        DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0)');

        Schema::create('order_status_history', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        DB::statement('ALTER TABLE order_status_history ADD COLUMN old_status order_status');
        DB::statement('ALTER TABLE order_status_history ADD COLUMN new_status order_status NOT NULL');

        Schema::create('coupons', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('code', 60)->unique();
            $table->string('type', 20);
            $table->decimal('value', 12, 2)->default(0);
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestampTz('valid_from')->nullable();
            $table->timestampTz('valid_to')->nullable();
            $table->decimal('min_order_total', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        Schema::create('order_coupons', function (Blueprint $table) {
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('coupon_id')->constrained('coupons')->restrictOnDelete();
            $table->decimal('discount_amount', 12, 2);
            $table->primary(['order_id', 'coupon_id']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('method', 30);
            $table->string('currency', 3)->default('BRL');
            $table->decimal('amount', 12, 2);
            $table->string('provider', 50)->nullable();
            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->index('order_id', 'idx_payments_order');
        });

        DB::statement("ALTER TABLE payments ADD COLUMN status payment_status NOT NULL DEFAULT 'pending'");
        DB::statement('CREATE INDEX IF NOT EXISTS idx_payment_status_order ON payments(status, order_id)');

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('provider_tx_id', 120)->nullable();
            $table->jsonb('raw_payload')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        DB::statement('ALTER TABLE payment_transactions ADD COLUMN status payment_status NOT NULL');

        Schema::create('shipments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('carrier', 100)->nullable();
            $table->string('service', 100)->nullable();
            $table->string('tracking_code', 100)->nullable();
            $table->timestampTz('shipped_at')->nullable();
            $table->timestampTz('delivered_at')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        DB::statement("ALTER TABLE shipments ADD COLUMN status shipment_status NOT NULL DEFAULT 'ready'");
        DB::statement('CREATE INDEX IF NOT EXISTS idx_shipment_status_order ON shipments(status, order_id)');

        Schema::create('shipment_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->integer('quantity');
        });

        DB::statement('ALTER TABLE shipment_items ADD CONSTRAINT shipment_items_quantity_check CHECK (quantity > 0)');

        Schema::create('returns', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('status', 20)->default('requested');
            $table->text('reason')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestampTz('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        Schema::create('return_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('return_id')->constrained('returns')->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->restrictOnDelete();
            $table->integer('quantity');
            $table->string('condition', 40)->nullable();
        });

        DB::statement('ALTER TABLE return_items ADD CONSTRAINT return_items_quantity_check CHECK (quantity > 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_items');
        Schema::dropIfExists('returns');
        Schema::dropIfExists('shipment_items');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_coupons');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
