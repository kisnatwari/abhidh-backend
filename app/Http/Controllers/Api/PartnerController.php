<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class PartnerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Partner::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by active status if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $partners = $query->orderBy('order')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $partners->items(),
            'pagination' => [
                'current_page' => $partners->currentPage(),
                'last_page' => $partners->lastPage(),
                'per_page' => $partners->perPage(),
                'total' => $partners->total(),
                'from' => $partners->firstItem(),
                'to' => $partners->lastItem(),
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
                'link' => ['nullable', 'url', 'max:255'],
                'order' => ['nullable', 'integer'],
                'is_active' => ['nullable', 'boolean'],
                'logo_file' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
            ]);

            $partner = Partner::create([
                'name' => $validated['name'],
                'link' => $validated['link'] ?? null,
                'order' => $validated['order'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if ($request->hasFile('logo_file')) {
                $path = $request->file('logo_file')->store('partners', 'public');
                $partner->update(['logo_path' => $path]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Partner created successfully.',
                'data' => $partner->fresh(),
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
    public function show(Partner $partner): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $partner,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Partner $partner): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'link' => ['nullable', 'url', 'max:255'],
                'order' => ['nullable', 'integer'],
                'is_active' => ['nullable', 'boolean'],
                'logo_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
            ]);

            $partner->update([
                'name' => $validated['name'],
                'link' => $validated['link'] ?? $partner->link,
                'order' => $validated['order'] ?? $partner->order,
                'is_active' => $validated['is_active'] ?? $partner->is_active,
            ]);

            if ($request->hasFile('logo_file')) {
                if ($partner->logo_path) {
                    Storage::disk('public')->delete($partner->logo_path);
                }
                $path = $request->file('logo_file')->store('partners', 'public');
                $partner->update(['logo_path' => $path]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Partner updated successfully.',
                'data' => $partner->fresh(),
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
    public function destroy(Partner $partner): JsonResponse
    {
        if ($partner->logo_path) {
            Storage::disk('public')->delete($partner->logo_path);
        }

        $partner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Partner deleted successfully.',
        ]);
    }
}
