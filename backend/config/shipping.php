<?php

return [
    
    'live_enabled' => filter_var(env('SHIPPING_LIVE_ENABLED', false), FILTER_VALIDATE_BOOL),
    
    'origin_zip' => env('SHIPPING_ORIGIN_ZIP', '01001-000'),

    
    'default_item_weight_kg' => (float) env('SHIPPING_DEFAULT_ITEM_WEIGHT_KG', 0.3), 

    
    'default_dimensions_cm' => [
        'length' => (int) env('SHIPPING_DEFAULT_LENGTH_CM', 20),
        'width'  => (int) env('SHIPPING_DEFAULT_WIDTH_CM', 20),
        'height' => (int) env('SHIPPING_DEFAULT_HEIGHT_CM', 15),
        'diameter' => (int) env('SHIPPING_DEFAULT_DIAMETER_CM', 0),
    ],

    
    
    'service_codes' => explode(',', env('SHIPPING_CORREIOS_SERVICE_CODES', '04014,04510')),
];
