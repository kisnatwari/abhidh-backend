<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\GalleryPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class GalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
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
        $galleries = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('galleries/index', [
            'galleries' => $galleries,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'option' => ['nullable', Rule::in(['Abhidh', 'Abhidh Creative', 'Abhidh Academy'])],
            'media_type' => ['required', Rule::in(['image_group', 'youtube'])],
            'photos' => [
                'nullable',
                'array',
                'min:1',
                Rule::requiredIf(fn () => $request->input('media_type') === 'image_group'),
            ],
            'photos.*' => ['image', 'max:2048'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'youtube_url' => [
                'nullable',
                'url',
                Rule::requiredIf(fn () => $request->input('media_type') === 'youtube'),
            ],
        ]);

        $gallery = Gallery::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'option' => $validated['option'] ?? null,
            'media_type' => $validated['media_type'],
            'youtube_url' => $validated['media_type'] === 'youtube' ? $validated['youtube_url'] : null,
        ]);

        if ($validated['media_type'] === 'image_group') {
            $photos = $request->file('photos', []);
            $captions = $request->input('captions', []);

            foreach ($photos as $index => $photo) {
                $path = $photo->store('galleries', 'public');
                $caption = $captions[$index] ?? null;

                GalleryPhoto::create([
                    'gallery_id' => $gallery->id,
                    'photo_path' => $path,
                    'caption' => $caption,
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()
            ->route('galleries.index')
            ->with('success', 'Gallery created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Gallery $gallery)
    {
        $gallery->load('photos');
        return Inertia::render('galleries/show', [
            'gallery' => $gallery,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Gallery $gallery)
    {
        $gallery->load('photos');
        return Inertia::render('galleries/edit', [
            'gallery' => $gallery,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Gallery $gallery)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'option' => ['nullable', Rule::in(['Abhidh', 'Abhidh Creative', 'Abhidh Academy'])],
            'media_type' => ['required', Rule::in(['image_group', 'youtube'])],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['image', 'max:2048'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'existing_photos' => ['nullable', 'array'],
            'existing_photos.*.id' => ['required_with:existing_photos', 'exists:gallery_photos,id'],
            'existing_photos.*.caption' => ['nullable', 'string', 'max:255'],
            'deleted_photos' => ['nullable', 'array'],
            'deleted_photos.*' => ['exists:gallery_photos,id'],
            'youtube_url' => [
                'nullable',
                'url',
                Rule::requiredIf(fn () => $request->input('media_type') === 'youtube'),
            ],
        ]);

        $gallery->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'option' => $validated['option'] ?? null,
            'media_type' => $validated['media_type'],
            'youtube_url' => $validated['media_type'] === 'youtube' ? $validated['youtube_url'] : null,
        ]);

        $gallery->load('photos');

        if ($validated['media_type'] === 'youtube') {
            // Remove all existing photos when switching to video mode
            foreach ($gallery->photos as $photo) {
                Storage::disk('public')->delete($photo->photo_path);
                $photo->delete();
            }
        } else {
            // Update existing photos
            if (isset($validated['existing_photos'])) {
                foreach ($validated['existing_photos'] as $photoData) {
                    GalleryPhoto::where('id', $photoData['id'])
                        ->where('gallery_id', $gallery->id)
                        ->update(['caption' => $photoData['caption']]);
                }
            }

            // Delete removed photos
            if (isset($validated['deleted_photos'])) {
                $photosToDelete = GalleryPhoto::whereIn('id', $validated['deleted_photos'])
                    ->where('gallery_id', $gallery->id)
                    ->get();

                foreach ($photosToDelete as $photo) {
                    Storage::disk('public')->delete($photo->photo_path);
                    $photo->delete();
                }
            }

            // Add new photos
            if (isset($validated['photos'])) {
                $currentMaxOrder = $gallery->photos()->max('sort_order') ?? -1;
                $photos = $request->file('photos', []);
                $captions = $request->input('captions', []);

                foreach ($photos as $index => $photo) {
                    $path = $photo->store('galleries', 'public');
                    $caption = $captions[$index] ?? null;

                    GalleryPhoto::create([
                        'gallery_id' => $gallery->id,
                        'photo_path' => $path,
                        'caption' => $caption,
                        'sort_order' => $currentMaxOrder + $index + 1,
                    ]);
                }
            }
        }

        if ($validated['media_type'] === 'image_group' && $gallery->photos()->count() === 0) {
            throw ValidationException::withMessages([
                'photos' => 'Please upload at least one photo for an image gallery.',
            ]);
        }

        return redirect()
            ->route('galleries.index')
            ->with('success', 'Gallery updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Gallery $gallery)
    {
        // Delete all photos
        foreach ($gallery->photos as $photo) {
            Storage::disk('public')->delete($photo->photo_path);
        }
        
        $gallery->delete();

        return redirect()
            ->route('galleries.index')
            ->with('success', 'Gallery deleted successfully.');
    }
}
