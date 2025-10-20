<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * List authenticated user's addresses.
     */
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->get();

        return response()->json($addresses);
    }

    /**
     * Create a new address for authenticated user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            // CEP must be 8 digits (allow formatted input but validate digits)
            'zip_code' => ['required', 'string', 'max:10', 'regex:/^\D*(\d\D*){8}$/'],
            'street' => 'required|string|max:255',
            // number requires at least one digit, up to 20 chars (allows complements like 12A)
            'number' => ['required', 'string', 'max:20', 'regex:/.*\d.*/'],
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            // UF: exactly two letters
            'state' => ['required', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // If this is set as default, unset all other default addresses
        if ($request->input('is_default', false)) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create([
            'name' => $request->name,
            'zip_code' => $request->zip_code,
            'street' => $request->street,
            'number' => $request->number,
            'complement' => $request->complement,
            'neighborhood' => $request->neighborhood,
            'city' => $request->city,
            'state' => $request->state,
            'is_default' => $request->input('is_default', false),
        ]);

        return response()->json($address, 201);
    }

    /**
     * Delete an address.
     */
    public function destroy(Request $request, string $id)
    {
        $address = $request->user()->addresses()->find($id);

        if (!$address) {
            return response()->json([
                'error' => 'Address not found'
            ], 404);
        }

        $address->delete();

        return response()->json([
            'message' => 'Address deleted successfully'
        ]);
    }
}
