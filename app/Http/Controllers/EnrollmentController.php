<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Course;
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
        $enrollments = Enrollment::with(['user', 'course.program'])
            ->latest('enrollment_date')
            ->paginate(10)
            ->withQueryString();

        $courses = Course::with('program')->select('id', 'name', 'program_id')->get();
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('enrollments/index', [
            'enrollments' => $enrollments,
            'courses' => $courses,
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
            'course_id' => ['required', 'exists:courses,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['required', 'in:active,completed,dropped'],
            'is_paid' => ['nullable', 'boolean'],
        ]);

        // Check if user is already enrolled in this course
        $existingEnrollment = Enrollment::where('user_id', $validated['user_id'])
            ->where('course_id', $validated['course_id'])
            ->first();

        if ($existingEnrollment) {
            return back()->withErrors(['user_id' => 'User is already enrolled in this course.']);
        }

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
        $enrollment->load(['user', 'course.program']);
        return Inertia::render('enrollments/show', [
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Enrollment $enrollment)
    {
        $enrollment->load(['user', 'course.program']);
        $courses = Course::with('program')->select('id', 'name', 'program_id')->get();
        $users = User::select('id', 'name', 'email')->get();
        
        return Inertia::render('enrollments/edit', [
            'enrollment' => $enrollment,
            'courses' => $courses,
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
            'course_id' => ['required', 'exists:courses,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['required', 'in:active,completed,dropped'],
            'is_paid' => ['nullable', 'boolean'],
        ]);

        // Check if user is already enrolled in this course (excluding current enrollment)
        $existingEnrollment = Enrollment::where('user_id', $validated['user_id'])
            ->where('course_id', $validated['course_id'])
            ->where('id', '!=', $enrollment->id)
            ->first();

        if ($existingEnrollment) {
            return back()->withErrors(['user_id' => 'User is already enrolled in this course.']);
        }

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


