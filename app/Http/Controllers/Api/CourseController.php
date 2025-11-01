<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['program']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Course type filter
        if ($request->has('course_type') && $request->course_type && $request->course_type !== 'all') {
            $query->where('course_type', $request->course_type);
        }

        // Program filter
        if ($request->has('program_id') && $request->program_id) {
            $query->where('program_id', $request->program_id);
        }

        // Featured filter
        if ($request->has('featured') && $request->featured !== 'all') {
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
     * Get programs list for course selection.
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
