<?php

return [
    // Enable live requests to Correios API. Set to false to use fallback calculation.
    'live_enabled' => filter_var(env('SHIPPING_LIVE_ENABLED', false), FILTER_VALIDATE_BOOL),
    // Origin ZIP code for shipments (CEP). Example: 01001-000
    'origin_zip' => env('SHIPPING_ORIGIN_ZIP', '01001-000'),

    // Default per-item weight in kilograms when product weight is unknown
    'default_item_weight_kg' => (float) env('SHIPPING_DEFAULT_ITEM_WEIGHT_KG', 0.3), // 300g

    // Default package dimensions in centimeters (Correios minimums apply)
    'default_dimensions_cm' => [
        'length' => (int) env('SHIPPING_DEFAULT_LENGTH_CM', 20),
        'width'  => (int) env('SHIPPING_DEFAULT_WIDTH_CM', 20),
        'height' => (int) env('SHIPPING_DEFAULT_HEIGHT_CM', 15),
        'diameter' => (int) env('SHIPPING_DEFAULT_DIAMETER_CM', 0),
    ],

    // Correios service codes to query (SEDEX/PAC retail)
    // 04014 = SEDEX à vista, 04510 = PAC à vista (codes may change over time)
    'service_codes' => explode(',', env('SHIPPING_CORREIOS_SERVICE_CODES', '04014,04510')),
];
