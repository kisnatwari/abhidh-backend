<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->has('category') && $request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Order by latest
        $query->latest();

        // Pagination
        $perPage = $request->get('per_page', 10);
        $services = $query->paginate($perPage);

        // Transform accent_color to hex code
        $transformedItems = collect($services->items())->map(function ($service) {
            $service->accent_color = $service->accent_color_hex;
            return $service;
        })->values()->all();

        return response()->json([
            'success' => true,
            'data' => $transformedItems,
            'pagination' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
                'from' => $services->firstItem(),
                'to' => $services->lastItem(),
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug): JsonResponse
    {
        $service = Service::where('slug', $slug)
            ->firstOrFail();

        // Transform accent_color to hex code
        $service->accent_color = $service->accent_color_hex;

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }
}
