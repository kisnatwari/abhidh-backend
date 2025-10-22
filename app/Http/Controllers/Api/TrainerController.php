<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class TrainerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Trainer::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('expertise', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $trainers = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $trainers->items(),
            'pagination' => [
                'current_page' => $trainers->currentPage(),
                'last_page' => $trainers->lastPage(),
                'per_page' => $trainers->perPage(),
                'total' => $trainers->total(),
                'from' => $trainers->firstItem(),
                'to' => $trainers->lastItem(),
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
                'name' => ['required', 'string', 'max:255'],
                'expertise' => ['required', 'string', 'max:255'],
                'years_of_experience' => ['required', 'integer', 'min:0'],
                'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            ]);

            $trainer = Trainer::create([
                'name' => $validated['name'],
                'expertise' => $validated['expertise'],
                'years_of_experience' => $validated['years_of_experience'],
            ]);

            // Handle photo upload
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('trainers', 'public');
                $trainer->update(['photo_path' => $photoPath]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Trainer created successfully.',
                'data' => $trainer->fresh(),
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
    public function show(Trainer $trainer): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $trainer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trainer $trainer): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'expertise' => ['required', 'string', 'max:255'],
                'years_of_experience' => ['required', 'integer', 'min:0'],
                'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            ]);

            $trainer->update([
                'name' => $validated['name'],
                'expertise' => $validated['expertise'],
                'years_of_experience' => $validated['years_of_experience'],
            ]);

            // Handle photo upload
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($trainer->photo_path) {
                    Storage::disk('public')->delete($trainer->photo_path);
                }
                
                $photoPath = $request->file('photo')->store('trainers', 'public');
                $trainer->update(['photo_path' => $photoPath]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Trainer updated successfully.',
                'data' => $trainer->fresh(),
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
    public function destroy(Trainer $trainer): JsonResponse
    {
        // Delete photo if exists
        if ($trainer->photo_path) {
            Storage::disk('public')->delete($trainer->photo_path);
        }

        $trainer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trainer deleted successfully.',
        ]);
    }
}
