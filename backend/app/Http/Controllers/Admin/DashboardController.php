<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardMetricsService $metrics)
    {
    }

    /**
     * Return an overview of admin dashboard metrics.
     */
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->metrics->buildSummary($request),
        ]);
    }
}
