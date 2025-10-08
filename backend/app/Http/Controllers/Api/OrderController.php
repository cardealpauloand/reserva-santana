<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * List authenticated user's orders with order items.
     */
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('orderItems')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Create a new order with items.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string',
            'shipping_address.zip_code' => 'required|string',
            'shipping_address.street' => 'required|string',
            'shipping_address.number' => 'required|string',
            'shipping_address.complement' => 'nullable|string',
            'shipping_address.neighborhood' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.state' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.product_name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price_at_purchase' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();

            // Calculate total from items
            $total = 0;
            foreach ($request->items as $item) {
                $total += $item['quantity'] * $item['price_at_purchase'];
            }

            // Create order
            $order = $user->orders()->create([
                'currency' => 'BRL',
                'date' => now(),
                'shipping_address_data' => $request->shipping_address,
                'subtotal' => $total,
                'discount_total' => 0,
                'shipping_total' => 0,
                'tax_total' => 0,
                'grand_total' => $total,
                'total' => $total,
                'status' => 'pending_payment',
                'created_by' => $user->id,
            ]);

            // Create order items
            foreach ($request->items as $item) {
                $itemTotal = $item['quantity'] * $item['price_at_purchase'];

                $order->orderItems()->create([
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $item['price_at_purchase'],
                    'discount' => 0,
                    'total_price' => $itemTotal,
                    'created_by' => $user->id,
                ]);
            }

            DB::commit();

            // Load order items for response
            $order->load('orderItems');

            return response()->json($order, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Order creation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all orders (admin only).
     */
    public function adminIndex(Request $request)
    {
        $orders = Order::with(['orderItems', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Update order status (admin only).
     */
    public function adminUpdate(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:draft,pending_payment,paid,picking,shipped,delivered,canceled,refunded',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'error' => 'Order not found'
            ], 404);
        }

        $order->update([
            'status' => $request->status,
            'updated_by' => $request->user()->id,
        ]);

        $order->load('orderItems');

        return response()->json($order);
    }
}
