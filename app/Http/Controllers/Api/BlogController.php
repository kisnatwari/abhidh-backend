<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Blog::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%')
                  ->orWhere('category', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->has('category') && $request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $blogs = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $blogs->items(),
            'pagination' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
                'from' => $blogs->firstItem(),
                'to' => $blogs->lastItem(),
            ],
        ]);
    }


    /**
     * Display the specified resource.
     */
    public function show(Blog $blog): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $blog,
        ]);
    }

}
