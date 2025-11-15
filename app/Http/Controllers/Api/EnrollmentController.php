<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Enrollment::with(['user', 'course.program'])
            ->where('user_id', $user->id);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->whereHas('course', function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Payment filter
        if ($request->has('is_paid') && $request->is_paid && $request->is_paid !== 'all') {
            $query->where('is_paid', $request->is_paid === '1');
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $enrollments = $query->latest('enrollment_date')->paginate($perPage);

        // Remove RTE content from self-paced course topics in list view
        $transformedEnrollments = collect($enrollments->items())->map(function ($enrollment) {
            if ($enrollment->course && $enrollment->course->course_type === 'self_paced' && $enrollment->course->topics) {
                $course = $enrollment->course;
                $topics = $course->topics;
                if (is_array($topics)) {
                    $topics = array_map(function ($topic) {
                        if (isset($topic['content'])) {
                            unset($topic['content']);
                        }
                        return $topic;
                    }, $topics);
                    $course->setAttribute('topics', $topics);
                }
            }
            
            // Transform program color to hex code if program exists
            if ($enrollment->course && $enrollment->course->program && $enrollment->course->program->color) {
                $enrollment->course->program->color = $enrollment->course->program->color_hex;
            }
            
            return $enrollment;
        })->values()->all();

        return response()->json([
            'success' => true,
            'data' => $transformedEnrollments,
            'pagination' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
                'from' => $enrollments->firstItem(),
                'to' => $enrollments->lastItem(),
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
                'user_id' => ['required', 'exists:users,id'],
                'enrollment_date' => ['nullable', 'date'],
                'status' => ['required', 'in:active,completed,dropped'],
                'is_paid' => ['nullable', 'boolean'],
            ]);

            $validated['enrollment_date'] = $validated['enrollment_date'] ?? now();
            $validated['is_paid'] = (bool) ($validated['is_paid'] ?? false);

            $enrollment = Enrollment::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Enrollment created successfully.',
                'data' => $enrollment->load(['user', 'course.program']),
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
    public function show(Request $request, Enrollment $enrollment): JsonResponse
    {
        $user = $request->user();
        
        // Ensure user can only view their own enrollment
        if ($enrollment->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only view your own enrollments.',
            ], 403);
        }
        
        // Load full course data with content
        $enrollment->load(['user', 'course.program']);
        
        // Transform program color to hex code if program exists
        if ($enrollment->course && $enrollment->course->program && $enrollment->course->program->color) {
            $enrollment->course->program->color = $enrollment->course->program->color_hex;
        }
        
        return response()->json([
            'success' => true,
            'data' => $enrollment,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Enrollment $enrollment): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => ['required', 'exists:users,id'],
                'enrollment_date' => ['nullable', 'date'],
                'status' => ['required', 'in:active,completed,dropped'],
                'is_paid' => ['nullable', 'boolean'],
            ]);

            $validated['is_paid'] = (bool) ($validated['is_paid'] ?? false);

            $enrollment->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Enrollment updated successfully.',
                'data' => $enrollment->load(['user', 'course.program']),
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
    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $enrollment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Enrollment deleted successfully.',
        ]);
    }

    /**
     * Get users for enrollment selection.
     */
    public function options(): JsonResponse
    {
        $users = User::select('id', 'name', 'email')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users,
            ],
        ]);
    }
}
