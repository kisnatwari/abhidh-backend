<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Program::withCount('courses');

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

        // Pagination
        $perPage = $request->get('per_page', 10);
        $programs = $query->latest()->paginate($perPage);

        // Transform color field to hex code
        $transformedItems = collect($programs->items())->map(function ($program) {
            $program->color = $program->color_hex;
            return $program;
        })->values()->all();

        return response()->json([
            'success' => true,
            'data' => $transformedItems,
            'pagination' => [
                'current_page' => $programs->currentPage(),
                'last_page' => $programs->lastPage(),
                'per_page' => $programs->perPage(),
                'total' => $programs->total(),
                'from' => $programs->firstItem(),
                'to' => $programs->lastItem(),
            ],
        ]);
    }


    /**
     * Display the specified resource.
     */
    public function show(Program $program): JsonResponse
    {
        $program->load('courses');
        
        // Transform color field to hex code
        $program->color = $program->color_hex;
        
        return response()->json([
            'success' => true,
            'data' => $program,
        ]);
    }

}
