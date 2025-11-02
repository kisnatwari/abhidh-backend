<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Team::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('designation', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $teams = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $teams->items(),
            'pagination' => [
                'current_page' => $teams->currentPage(),
                'last_page' => $teams->lastPage(),
                'per_page' => $teams->perPage(),
                'total' => $teams->total(),
                'from' => $teams->firstItem(),
                'to' => $teams->lastItem(),
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $team,
        ]);
    }
}
