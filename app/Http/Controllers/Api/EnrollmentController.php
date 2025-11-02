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
        $query = Enrollment::with(['user', 'course.program']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
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

        return response()->json([
            'success' => true,
            'data' => $enrollments->items(),
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
    public function show(Enrollment $enrollment): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $enrollment->load(['user', 'course.program']),
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
