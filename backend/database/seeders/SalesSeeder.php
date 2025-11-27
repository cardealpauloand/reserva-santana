<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Faker\Generator as FakerGenerator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SalesSeeder extends Seeder
{
    private const TARGET_ORDER_COUNT = 720;

    
    private const STATUS_WEIGHTS = [
        'pending_payment' => 0.12,
        'paid' => 0.18,
        'picking' => 0.12,
        'shipped' => 0.18,
        'delivered' => 0.30,
        'canceled' => 0.06,
        'refunded' => 0.04,
    ];

    private const PAYMENT_METHODS = ['credit_card', 'pix', 'boleto', 'bank_transfer'];

    private const PAYMENT_PROVIDERS = ['Pagar.me', 'Mercado Pago', 'PagSeguro', 'Pix', 'Iugu'];

    private const CARRIERS = [
        ['name' => 'Correios', 'services' => ['PAC', 'SEDEX']],
        ['name' => 'Jadlog', 'services' => ['Express', 'Economico']],
        ['name' => 'Loggi', 'services' => ['Same-Day', 'Express']],
        ['name' => 'FedEx', 'services' => ['Priority', 'Economy']],
    ];

    
    public function run(): void
    {
        if (! Schema::hasTable('orders')) {
            $this->command?->warn('Orders table not found. Skipping SalesSeeder.');
            return;
        }

        $products = Product::query()->active()->get();

        if ($products->isEmpty()) {
            $this->command?->warn('No products available. Run CatalogSeeder before SalesSeeder.');
            return;
        }

        $customers = $this->prepareCustomers();

        if ($customers->isEmpty()) {
            $this->command?->warn('No customers available to attach sales.');
            return;
        }

        $faker = FakerFactory::create('pt_BR');
        $addressStrategy = $this->detectAddressStrategy();
        $addressBook = $this->ensureAddresses($customers, $faker, $addressStrategy);

        $this->resetOrderData();

        $startDate = now()->startOfYear()->startOfDay();
        $endDate = now();

        DB::transaction(function () use ($products, $customers, $addressBook, $addressStrategy, $faker, $startDate, $endDate) {
            $ordersToCreate = min(self::TARGET_ORDER_COUNT, $customers->count() * 6);

            for ($i = 0; $i < $ordersToCreate; $i++) {
                $customer = $customers->random();
                $addressOptions = $addressBook[$customer->id] ?? collect();

                if ($addressOptions->isEmpty()) {
                    continue;
                }

                $addressRecord = $addressOptions->random();
                $orderDate = $this->randomDateTimeBetween($startDate, $endDate);
                $status = $this->pickOrderStatus();
                $items = $this->buildOrderItems($products);

                if ($items->isEmpty()) {
                    continue;
                }

                $subtotal = round($items->sum('line_subtotal'), 2);
                $itemDiscounts = round($items->sum('line_discount'), 2);
                $extraDiscount = random_int(0, 100) < 20 ? round($subtotal * random_int(5, 12) / 100, 2) : 0;
                $discountTotal = min($subtotal, round($itemDiscounts + $extraDiscount, 2));
                $shippingTotal = $subtotal >= 400 ? 0 : round(random_int(0, 3500) / 100, 2);
                $taxTotal = round($subtotal * random_int(50, 220) / 10000, 2);
                $grandTotal = round(max(50, $subtotal - $discountTotal + $shippingTotal + $taxTotal), 2);

                $shippingAddressId = $this->resolveAddressIdForOrders($addressRecord, $addressStrategy);
                $shippingData = $addressRecord['shipping_data'];

                $order = new Order();
                $order->user_id = $customer->id;
                $order->currency = 'BRL';
                $order->date = $orderDate->toDateString();
                $order->shipping_address_id = $shippingAddressId;
                $order->billing_address_id = $shippingAddressId;
                $order->shipping_address_data = $shippingData;
                $order->subtotal = $subtotal;
                $order->discount_total = $discountTotal;
                $order->shipping_total = $shippingTotal;
                $order->tax_total = $taxTotal;
                $order->grand_total = $grandTotal;
                $order->total = $grandTotal;
                $order->status = $status;
                $order->created_at = $orderDate;
                $order->updated_at = $orderDate->copy()->addHours(random_int(2, 72));
                $order->saveQuietly();

                $orderItems = $this->persistOrderItems($order, $items);
                $this->seedStatusHistory($order, $status, $orderDate);
                $this->seedPayment($order, $status, $grandTotal, $orderDate);
                $this->seedShipment($order, $status, $orderItems, $orderDate);
            }
        });
    }

    
    private function prepareCustomers(): Collection
    {
        $minimumCustomers = 120;
        $currentCount = User::query()->count();

        if ($currentCount < $minimumCustomers) {
            User::factory()->count($minimumCustomers - $currentCount)->create();
        }

        $startOfYear = now()->startOfYear();
        $now = now();

        $customers = User::query()->get();

        $customers->each(function (User $user) use ($startOfYear, $now) {
            $createdAt = $this->randomDateTimeBetween($startOfYear, $now);
            $updatedAt = $createdAt->copy()->addDays(random_int(0, 30))->addHours(random_int(0, 12));

            User::withoutTimestamps(function () use ($user, $createdAt, $updatedAt) {
                $user->created_at = $createdAt;
                $user->updated_at = $updatedAt;
                $user->saveQuietly();
            });
        });

        return $customers;
    }

    
    private function resetOrderData(): void
    {
        $tables = [
            'shipment_items',
            'shipments',
            'payment_transactions',
            'payments',
            'order_coupons',
            'order_status_history',
            'order_items',
            'return_items',
            'returns',
            'orders',
        ];

        foreach ($tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            try {
                DB::statement("TRUNCATE TABLE {$table} RESTART IDENTITY CASCADE");
            } catch (\Throwable $exception) {
                DB::table($table)->delete();
            }
        }
    }

    
    private function detectAddressStrategy(): array
    {
        $columnType = null;

        if (Schema::hasColumn('orders', 'shipping_address_id')) {
            $columnType = Schema::getColumnType('orders', 'shipping_address_id');
        }

        $legacyTableExists = Schema::hasTable('addresses_old');
        $modernTableExists = Schema::hasTable('addresses');

        return [
            'useLegacy' => $legacyTableExists && $columnType !== 'uuid',
            'legacyTable' => $legacyTableExists ? 'addresses_old' : null,
            'modernTable' => $modernTableExists ? 'addresses' : null,
        ];
    }

    
    private function ensureAddresses(Collection $customers, FakerGenerator $faker, array $strategy): Collection
    {
        return $customers->mapWithKeys(function (User $user) use ($faker, $strategy) {
            $records = collect(['Residencial', 'Entrega'])->map(
                fn (string $label) => $this->upsertAddressRecord($user, $label, $faker, $strategy)
            );

            return [$user->id => $records];
        });
    }

    
    private function upsertAddressRecord(User $user, string $label, FakerGenerator $faker, array $strategy): array
    {
        $addressName = sprintf('%s - %s', $user->name, $label);
        $street = $faker->streetName();
        $number = (string) $faker->buildingNumber();
        $complement = random_int(0, 100) < 30 ? $faker->secondaryAddress() : null;
        $neighborhood = $faker->citySuffix();
        $city = $faker->city();
        $state = $faker->stateAbbr();
        $zip = preg_replace('/\D/', '', $faker->postcode());
        $phone = $faker->phoneNumber();

        $modernId = null;
        $legacyId = null;

        if ($strategy['modernTable']) {
            $modern = Address::query()->firstOrCreate(
                ['user_id' => $user->id, 'name' => $addressName],
                [
                    'zip_code' => $zip,
                    'street' => $street,
                    'number' => $number,
                    'complement' => $complement,
                    'neighborhood' => $neighborhood,
                    'city' => $city,
                    'state' => $state,
                    'is_default' => $label === 'Residencial',
                ]
            );

            $modernId = $modern->id;
        }

        if ($strategy['legacyTable']) {
            $legacyId = DB::table('addresses_old')
                ->where('user_id', $user->id)
                ->where('name', $addressName)
                ->value('id');

            if (! $legacyId) {
                $legacyId = DB::table('addresses_old')->insertGetId([
                    'user_id' => $user->id,
                    'name' => $addressName,
                    'phone' => $phone,
                    'street' => $street,
                    'number' => $number,
                    'complement' => $complement,
                    'district' => $neighborhood,
                    'city' => $city,
                    'state' => $state,
                    'zip' => $zip,
                    'country' => 'BR',
                    'is_default' => $label === 'Residencial',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return [
            'label' => $label,
            'shipping_data' => [
                'name' => $addressName,
                'street' => $street,
                'number' => $number,
                'complement' => $complement,
                'neighborhood' => $neighborhood,
                'city' => $city,
                'state' => $state,
                'zip' => $zip,
                'country' => 'BR',
                'phone' => $phone,
            ],
            'modern_id' => $modernId,
            'legacy_id' => $legacyId,
        ];
    }

    
    private function resolveAddressIdForOrders(array $addressRecord, array $strategy): ?string
    {
        if ($strategy['useLegacy'] && $addressRecord['legacy_id']) {
            return (string) $addressRecord['legacy_id'];
        }

        if (! $strategy['useLegacy'] && $addressRecord['modern_id']) {
            return (string) $addressRecord['modern_id'];
        }

        return (string) ($addressRecord['legacy_id'] ?? $addressRecord['modern_id']);
    }

    
    private function buildOrderItems(Collection $products): Collection
    {
        $maxItems = max(1, min(5, $products->count()));
        $count = random_int(1, $maxItems);
        $selectedProducts = $products->random($count);

        return collect($selectedProducts)->map(function (Product $product) {
            $quantity = random_int(1, 5);
            $unitPrice = (float) $product->price;
            $lineSubtotal = $unitPrice * $quantity;
            $lineDiscount = round($lineSubtotal * random_int(0, 15) / 100, 2);
            $lineTotal = round($lineSubtotal - $lineDiscount, 2);

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $quantity,
                'unit_price' => round($unitPrice, 2),
                'line_subtotal' => round($lineSubtotal, 2),
                'line_discount' => $lineDiscount,
                'line_total' => max(0.01, $lineTotal),
            ];
        });
    }

    
    private function persistOrderItems(Order $order, Collection $items): Collection
    {
        return $items->map(function (array $item) use ($order) {
            return OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'],
                'quantity' => $item['quantity'],
                'price_at_purchase' => $item['unit_price'],
                'discount' => $item['line_discount'],
                'total_price' => $item['line_total'],
            ]);
        });
    }

    
    private function seedStatusHistory(Order $order, string $finalStatus, Carbon $referenceDate): void
    {
        if (! Schema::hasTable('order_status_history')) {
            return;
        }

        $flow = $this->statusFlow($finalStatus);
        $timestamp = $referenceDate->copy();
        $records = [];

        for ($i = 1; $i < count($flow); $i++) {
            $previous = $flow[$i - 1];
            $current = $flow[$i];
            $timestamp = $timestamp->copy()->addHours(random_int(4, 36));

            $records[] = [
                'order_id' => $order->id,
                'changed_by' => null,
                'note' => null,
                'created_at' => $timestamp,
                'old_status' => $previous,
                'new_status' => $current,
            ];
        }

        if (! empty($records)) {
            DB::table('order_status_history')->insert($records);
        }
    }

    
    private function seedPayment(Order $order, string $orderStatus, float $amount, Carbon $orderDate): void
    {
        if (! Schema::hasTable('payments')) {
            return;
        }

        $method = Arr::random(self::PAYMENT_METHODS);
        $provider = Arr::random(self::PAYMENT_PROVIDERS);
        $paymentStatus = $this->mapPaymentStatus($orderStatus);
        $paidAt = in_array($paymentStatus, ['paid', 'refunded'], true)
            ? $orderDate->copy()->addHours(random_int(6, 60))
            : null;

        $paymentId = DB::table('payments')->insertGetId([
            'order_id' => $order->id,
            'method' => $method,
            'currency' => $order->currency,
            'amount' => $amount,
            'provider' => $provider,
            'paid_at' => $paidAt,
            'status' => $paymentStatus,
            'created_at' => $orderDate,
            'updated_at' => $orderDate,
        ]);

        if (Schema::hasTable('payment_transactions')) {
            DB::table('payment_transactions')->insert([
                'payment_id' => $paymentId,
                'provider_tx_id' => Str::upper(Str::random(12)),
                'raw_payload' => json_encode([
                    'method' => $method,
                    'provider' => $provider,
                    'status' => $paymentStatus,
                ], JSON_THROW_ON_ERROR),
                'status' => $paymentStatus,
                'created_at' => $orderDate,
            ]);
        }
    }

    
    private function seedShipment(Order $order, string $status, Collection $items, Carbon $orderDate): void
    {
        if (! Schema::hasTable('shipments') || ! in_array($status, ['shipped', 'delivered'], true)) {
            return;
        }

        $carrier = Arr::random(self::CARRIERS);
        $service = Arr::random($carrier['services']);
        $shippedAt = $orderDate->copy()->addDays(random_int(1, 4));
        $deliveredAt = $status === 'delivered'
            ? $shippedAt->copy()->addDays(random_int(1, 5))
            : null;

        $shipmentId = DB::table('shipments')->insertGetId([
            'order_id' => $order->id,
            'carrier' => $carrier['name'],
            'service' => $service,
            'tracking_code' => Str::upper(Str::random(14)),
            'shipped_at' => $shippedAt,
            'delivered_at' => $deliveredAt,
            'status' => $status === 'delivered' ? 'delivered' : 'shipped',
            'created_at' => $shippedAt,
            'updated_at' => $deliveredAt ?? $shippedAt,
        ]);

        if (Schema::hasTable('shipment_items')) {
            $items->each(function (OrderItem $item) use ($shipmentId) {
                DB::table('shipment_items')->insert([
                    'shipment_id' => $shipmentId,
                    'order_item_id' => $item->id,
                    'quantity' => $item->quantity,
                ]);
            });
        }
    }

    
    private function mapPaymentStatus(string $orderStatus): string
    {
        return match ($orderStatus) {
            'pending_payment' => 'pending',
            'canceled' => 'canceled',
            'refunded' => 'refunded',
            default => 'paid',
        };
    }

    
    private function statusFlow(string $finalStatus): array
    {
        return match ($finalStatus) {
            'pending_payment' => ['draft', 'pending_payment'],
            'paid' => ['draft', 'pending_payment', 'paid'],
            'picking' => ['draft', 'pending_payment', 'paid', 'picking'],
            'shipped' => ['draft', 'pending_payment', 'paid', 'picking', 'shipped'],
            'delivered' => ['draft', 'pending_payment', 'paid', 'picking', 'shipped', 'delivered'],
            'canceled' => ['draft', 'pending_payment', 'canceled'],
            'refunded' => ['draft', 'pending_payment', 'paid', 'refunded'],
            default => ['draft', $finalStatus],
        };
    }

    
    private function pickOrderStatus(): string
    {
        $totalWeight = array_sum(self::STATUS_WEIGHTS);
        $needle = mt_rand() / mt_getrandmax() * $totalWeight;

        foreach (self::STATUS_WEIGHTS as $status => $weight) {
            if ($needle <= $weight) {
                return $status;
            }

            $needle -= $weight;
        }

        return 'paid';
    }

    
    private function randomDateTimeBetween(Carbon $start, Carbon $end): Carbon
    {
        $timestamp = random_int($start->getTimestamp(), $end->getTimestamp());

        return Carbon::createFromTimestamp($timestamp);
    }
}
