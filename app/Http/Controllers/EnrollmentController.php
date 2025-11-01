<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $enrollments = Enrollment::with(['user'])
            ->latest('enrollment_date')
            ->paginate(10)
            ->withQueryString();

        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('enrollments/index', [
            'enrollments' => $enrollments,
            'users' => $users,
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
            'user_id' => ['required', 'exists:users,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['required', 'in:active,completed,dropped'],
            'is_paid' => ['nullable', 'boolean'],
        ]);

        $validated['enrollment_date'] = $validated['enrollment_date'] ?? now();
        $validated['is_paid'] = (bool) ($validated['is_paid'] ?? false);

        $enrollment = Enrollment::create($validated);

        return redirect()
            ->route('enrollments.index')
            ->with('success', 'Enrollment created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Enrollment $enrollment)
    {
        $enrollment->load(['user']);
        return Inertia::render('enrollments/show', [
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Enrollment $enrollment)
    {
        $enrollment->load(['user']);
        $users = User::select('id', 'name', 'email')->get();
        
        return Inertia::render('enrollments/edit', [
            'enrollment' => $enrollment,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['required', 'in:active,completed,dropped'],
            'is_paid' => ['nullable', 'boolean'],
        ]);

        $validated['is_paid'] = (bool) ($validated['is_paid'] ?? false);

        $enrollment->update($validated);

        return redirect()
            ->route('enrollments.index')
            ->with('success', 'Enrollment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return redirect()
            ->route('enrollments.index')
            ->with('success', 'Enrollment deleted successfully.');
    }
}


