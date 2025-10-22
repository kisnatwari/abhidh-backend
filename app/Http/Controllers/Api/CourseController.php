<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['program'])->withCount('enrollments');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Program filter
        if ($request->has('program') && $request->program && $request->program !== 'all') {
            $query->where('program_id', $request->program);
        }

        // Level filter
        if ($request->has('level') && $request->level && $request->level !== 'all') {
            $query->where('level', $request->level);
        }

        // Featured filter
        if ($request->has('featured') && $request->featured && $request->featured !== 'all') {
            $query->where('featured', $request->featured === '1');
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $courses = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $courses->items(),
            'pagination' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
                'from' => $courses->firstItem(),
                'to' => $courses->lastItem(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'program_id' => ['required', 'exists:programs,id'],
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'duration' => ['nullable', 'string', 'max:50'],
                'level' => ['required', 'in:beginner,intermediate,advanced,all_levels'],
                'featured' => ['nullable', 'boolean'],
            ]);

            $validated['featured'] = (bool) ($validated['featured'] ?? false);

            $course = Course::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully.',
                'data' => $course->load('program'),
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $course->load(['program', 'enrollments.user']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course): JsonResponse
    {
        try {
            $validated = $request->validate([
                'program_id' => ['required', 'exists:programs,id'],
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'duration' => ['nullable', 'string', 'max:50'],
                'level' => ['required', 'in:beginner,intermediate,advanced,all_levels'],
                'featured' => ['nullable', 'boolean'],
            ]);

            $validated['featured'] = (bool) ($validated['featured'] ?? false);

            $course->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully.',
                'data' => $course->load('program'),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully.',
        ]);
    }

    /**
     * Get programs for course selection.
     */
    public function programs(): JsonResponse
    {
        $programs = Program::select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }
}
