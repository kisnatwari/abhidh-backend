<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Gallery::with('photos');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('option', 'like', '%' . $request->search . '%');
            });
        }

        // Option filter
        if ($request->has('option') && $request->option && $request->option !== 'all') {
            $query->where('option', $request->option);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $galleries = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $galleries->items(),
            'pagination' => [
                'current_page' => $galleries->currentPage(),
                'last_page' => $galleries->lastPage(),
                'per_page' => $galleries->perPage(),
                'total' => $galleries->total(),
                'from' => $galleries->firstItem(),
                'to' => $galleries->lastItem(),
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
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'photos' => ['required', 'array', 'min:1'],
                'photos.*' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                'captions' => ['nullable', 'array'],
                'captions.*' => ['nullable', 'string', 'max:255'],
            ]);

            $gallery = Gallery::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
            ]);

            // Handle photo uploads
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $index => $photo) {
                    $photoPath = $photo->store('galleries', 'public');
                    $caption = $validated['captions'][$index] ?? null;
                    
                    GalleryPhoto::create([
                        'gallery_id' => $gallery->id,
                        'photo_path' => $photoPath,
                        'caption' => $caption,
                        'sort_order' => $index + 1,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Gallery created successfully.',
                'data' => $gallery->load('photos'),
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
    public function show(Gallery $gallery): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $gallery->load('photos'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Gallery $gallery): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'photos' => ['nullable', 'array'],
                'photos.*' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                'captions' => ['nullable', 'array'],
                'captions.*' => ['nullable', 'string', 'max:255'],
                'existing_photos' => ['nullable', 'array'],
                'existing_photos.*.id' => ['required_with:existing_photos', 'exists:gallery_photos,id'],
                'existing_photos.*.caption' => ['nullable', 'string', 'max:255'],
            ]);

            $gallery->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
            ]);

            // Handle existing photos updates
            if ($request->has('existing_photos')) {
                foreach ($validated['existing_photos'] as $photoData) {
                    $photo = GalleryPhoto::find($photoData['id']);
                    if ($photo) {
                        $photo->update(['caption' => $photoData['caption']]);
                    }
                }
            }

            // Handle new photo uploads
            if ($request->hasFile('photos')) {
                $existingPhotosCount = $gallery->photos()->count();
                
                foreach ($request->file('photos') as $index => $photo) {
                    $photoPath = $photo->store('galleries', 'public');
                    $caption = $validated['captions'][$index] ?? null;
                    
                    GalleryPhoto::create([
                        'gallery_id' => $gallery->id,
                        'photo_path' => $photoPath,
                        'caption' => $caption,
                        'sort_order' => $existingPhotosCount + $index + 1,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Gallery updated successfully.',
                'data' => $gallery->load('photos'),
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
    public function destroy(Gallery $gallery): JsonResponse
    {
        // Delete all photos
        foreach ($gallery->photos as $photo) {
            if ($photo->photo_path) {
                Storage::disk('public')->delete($photo->photo_path);
            }
        }

        $gallery->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gallery deleted successfully.',
        ]);
    }

    /**
     * Remove a specific photo from gallery.
     */
    public function destroyPhoto(GalleryPhoto $photo): JsonResponse
    {
        if ($photo->photo_path) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Photo deleted successfully.',
        ]);
    }
}
