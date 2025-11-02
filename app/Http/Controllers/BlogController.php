<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Blog::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%')
                  ->orWhere('option', 'like', '%' . $request->search . '%');
            });
        }

        // Option filter
        if ($request->has('option') && $request->option && $request->option !== 'all') {
            $query->where('option', $request->option);
        }

        // Status filter (published/draft)
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            }
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $blogs = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('blogs/index', [
            'blogs' => $blogs,
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
            'title'        => ['required', 'string', 'max:255'],
            'option'       => ['nullable', 'in:Abhidh,Abhidh Creative,Abhidh Academy'],
            'content'      => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'image'        => ['nullable', 'image', 'max:2048'], // 2MB limit
        ]);

        // Force boolean
        $validated['is_published'] = (bool) ($validated['is_published'] ?? false);

        // Generate slug
        $validated['slug'] = Str::slug($validated['title']);

        // Default publish date if published and no date given
        if ($validated['is_published'] && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blogs', 'public');
            $validated['image_path'] = $path;
        }

        $blog = Blog::create($validated);

        return redirect()
            ->route('blogs.index')
            ->with('success', 'Blog created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Blog $blog)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog)
    {
        return Inertia::render('blogs/edit', [
            'blog' => $blog,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'option'       => ['nullable', 'in:Abhidh,Abhidh Creative,Abhidh Academy'],
            'content'      => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'image'        => ['nullable', 'image', 'max:2048'],
        ]);
        $validated['is_published'] = (bool) ($validated['is_published'] ?? false);
        $validated['slug'] = Str::slug($validated['title']);
        if ($validated['is_published'] && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blogs', 'public');
            $validated['image_path'] = $path;
        }
        $blog->update($validated);
        return redirect()->route('blogs.index')->with('success', 'Blog updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        $blog->delete();
        return redirect()->route('blogs.index')->with('success', 'Blog deleted successfully.');
    }
}
