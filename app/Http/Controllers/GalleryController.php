<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\GalleryPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $galleries = Gallery::with('photos')
            ->latest()
            ->paginate(10)
            ->withQueryString();

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
            'photos' => ['required', 'array', 'min:1'],
            'photos.*' => ['image', 'max:2048'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
        ]);

        $gallery = Gallery::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
        ]);

        // Handle photo uploads
        foreach ($validated['photos'] as $index => $photo) {
            $path = $photo->store('galleries', 'public');
            $caption = $validated['captions'][$index] ?? null;
            
            GalleryPhoto::create([
                'gallery_id' => $gallery->id,
                'photo_path' => $path,
                'caption' => $caption,
                'sort_order' => $index,
            ]);
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
            'photos' => ['nullable', 'array'],
            'photos.*' => ['image', 'max:2048'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'existing_photos' => ['nullable', 'array'],
            'existing_photos.*.id' => ['required_with:existing_photos', 'exists:gallery_photos,id'],
            'existing_photos.*.caption' => ['nullable', 'string', 'max:255'],
            'deleted_photos' => ['nullable', 'array'],
            'deleted_photos.*' => ['exists:gallery_photos,id'],
        ]);

        $gallery->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
        ]);

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
            
            foreach ($validated['photos'] as $index => $photo) {
                $path = $photo->store('galleries', 'public');
                $caption = $validated['captions'][$index] ?? null;
                
                GalleryPhoto::create([
                    'gallery_id' => $gallery->id,
                    'photo_path' => $path,
                    'caption' => $caption,
                    'sort_order' => $currentMaxOrder + $index + 1,
                ]);
            }
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
