<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get authenticated user's profile.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        // Auto-create profile if it doesn't exist
        $profile = $user->profile;

        if (!$profile) {
            $profile = Profile::create([
                'user_id' => $user->id,
                'full_name' => $user->name,
            ]);
        }

        return response()->json($profile);
    }

    /**
     * Update authenticated user's profile.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Auto-create profile if it doesn't exist
        $profile = $user->profile;

        if (!$profile) {
            $profile = Profile::create([
                'user_id' => $user->id,
                'full_name' => $request->input('full_name', $user->name),
                'phone' => $request->input('phone'),
            ]);
        } else {
            $profile->update($request->only(['full_name', 'phone']));
        }

        return response()->json($profile);
    }
}
