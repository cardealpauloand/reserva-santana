<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CorreiosShippingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShippingController extends Controller
{
    public function quote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'destination_zip' => ['required', 'string', 'regex:/^\d{5}-?\d{3}$/'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.weight_kg' => ['nullable', 'numeric', 'min:0'],
            'items.*.dimensions_cm.length' => ['nullable', 'integer', 'min:16'],
            'items.*.dimensions_cm.width' => ['nullable', 'integer', 'min:11'],
            'items.*.dimensions_cm.height' => ['nullable', 'integer', 'min:2'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid payload',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $service = new CorreiosShippingService();

        try {
            $quotes = $service->calculateQuotes(
                $data['destination_zip'],
                $data['items']
            );

            return response()->json([
                'data' => $quotes,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Falha ao calcular frete',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
