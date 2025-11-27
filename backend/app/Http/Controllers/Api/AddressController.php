<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->get();

        return response()->json($addresses);
    }

    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^\D*(\d\D*){10,11}$/'],
            
            'zip_code' => ['required', 'string', 'max:10', 'regex:/^\D*(\d\D*){8}$/'],
            'street' => 'required|string|max:255',
            
            'number' => ['required', 'string', 'max:20', 'regex:/.*\d.*/'],
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            
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

        
        if ($request->input('is_default', false)) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create([
            'name' => $request->name,
            'phone' => $request->input('phone'),
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
