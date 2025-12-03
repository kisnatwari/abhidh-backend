<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Service::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->has('category') && $request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $services = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('services/index', [
            'services' => $services,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('services/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'category' => ['required', 'in:digital_marketing,it_development,creative_solutions'],
            'accent_color' => ['nullable', 'string', 'max:50'],
            'is_published' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
            'thumbnail' => ['nullable', 'image', 'max:2048'], // 2MB limit
        ]);

        // Force boolean
        $validated['is_published'] = (bool) ($validated['is_published'] ?? false);
        $validated['featured'] = (bool) ($validated['featured'] ?? false);
        $validated['order'] = $validated['order'] ?? 0;

        // Generate slug
        $validated['slug'] = Str::slug($validated['name']);

        // Handle thumbnail upload if provided
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('services', 'public');
            $validated['thumbnail_path'] = $path;
        }

        $service = Service::create($validated);

        return redirect()
            ->route('services.index')
            ->with('success', 'Service created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        return Inertia::render('services/show', [
            'service' => $service,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Service $service)
    {
        return Inertia::render('services/edit', [
            'service' => $service,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'category' => ['required', 'in:digital_marketing,it_development,creative_solutions'],
            'accent_color' => ['nullable', 'string', 'max:50'],
            'thumbnail' => ['nullable', 'image', 'max:2048'], // 2MB limit
        ]);

        // Generate slug if name changed
        if ($service->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle thumbnail upload if provided
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($service->thumbnail_path) {
                Storage::disk('public')->delete($service->thumbnail_path);
            }
            $path = $request->file('thumbnail')->store('services', 'public');
            $validated['thumbnail_path'] = $path;
        }

        $service->update($validated);

        return redirect()
            ->route('services.index')
            ->with('success', 'Service updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        // Delete thumbnail if exists
        if ($service->thumbnail_path) {
            Storage::disk('public')->delete($service->thumbnail_path);
        }

        $service->delete();

        return redirect()
            ->route('services.index')
            ->with('success', 'Service deleted successfully.');
    }
}
