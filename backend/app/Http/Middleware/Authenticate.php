<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API or JSON requests we want to return a JSON response instead of redirecting
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }

        // No traditional login route exists, so avoid resolving a named route.
        return null;
    }
}
