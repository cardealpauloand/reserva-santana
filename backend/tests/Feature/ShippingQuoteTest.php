<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class ShippingQuoteTest extends TestCase
{
    public function test_guest_can_get_shipping_quote(): void
    {
        Config::set('shipping.live_enabled', false);

        $payload = [
            'destination_zip' => '87302060',
            'items' => [
                [
                    'quantity' => 2,
                    'weight_kg' => 0.5,
                    'dimensions_cm' => [
                        'length' => 20,
                        'width' => 15,
                        'height' => 10,
                    ],
                ],
            ],
        ];

        $response = $this->postJson('/api/shipping/quote', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    [
                        'service_code',
                        'service_name',
                        'price',
                        'deadline_days',
                    ],
                ],
            ]);
    }

    public function test_shipping_quote_requires_valid_payload(): void
    {
        $response = $this->postJson('/api/shipping/quote', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors',
            ]);
    }
}
