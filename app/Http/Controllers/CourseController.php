<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $courses = Course::with(['program'])
            ->withCount('enrollments')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $programs = Program::select('id', 'name')->get();

        return Inertia::render('courses/index', [
            'courses' => $courses,
            'programs' => $programs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $programs = Program::select('id', 'name')->get();

        return Inertia::render('courses/create', [
            'programs' => $programs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $courseType = $request->input('course_type');

        if ($courseType === 'guided') {
            $validated = $request->validate([
                'course_type' => ['required', 'in:guided,self_paced'],
                'title' => ['required', 'string', 'max:255'],
                'description' => ['required', 'string'],
                'duration' => ['nullable', 'string', 'max:50'],
                'target_audience' => ['required', 'string'],
                'key_learning_objectives' => ['nullable', 'array'],
                'key_learning_objectives.*' => ['string'],
                'syllabus' => ['required', 'array'],
                'syllabus.*.session' => ['required', 'integer'],
                'syllabus.*.course_topic' => ['required', 'string'],
                'syllabus.*.learnings' => ['required', 'array'],
                'syllabus.*.learnings.*' => ['string'],
                'syllabus.*.outcomes' => ['nullable', 'array'],
                'syllabus.*.outcomes.*' => ['string'],
                'syllabus.*.hours' => ['required', 'numeric'],
                'program_id' => ['nullable', 'exists:programs,id'],
                'featured' => ['nullable', 'boolean'],
            ]);
        } else {
            $validated = $request->validate([
                'course_type' => ['required', 'in:guided,self_paced'],
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'topics' => ['required', 'array'],
                'topics.*.topic' => ['required', 'string'],
                'topics.*.subtopics' => ['nullable', 'array'],
                'topics.*.subtopics.*' => ['string'],
                'topics.*.duration' => ['nullable', 'string'],
                'topics.*.content' => ['required', 'string'],
                'program_id' => ['nullable', 'exists:programs,id'],
                'featured' => ['nullable', 'boolean'],
            ]);
        }

        $validated['featured'] = (bool) ($validated['featured'] ?? false);

        // Ensure JSON fields are properly formatted
        if (isset($validated['syllabus'])) {
            $validated['syllabus'] = array_values($validated['syllabus']);
        }
        if (isset($validated['topics'])) {
            $validated['topics'] = array_values($validated['topics']);
        }
        if (isset($validated['key_learning_objectives'])) {
            $validated['key_learning_objectives'] = array_values($validated['key_learning_objectives']);
        }

        $course = Course::create($validated);

        return redirect()
            ->route('courses.show', $course)
            ->with('success', 'Course created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $course->load(['program', 'enrollments.user']);
        return Inertia::render('courses/show', [
            'course' => $course,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        $programs = Program::select('id', 'name')->get();
        
        return Inertia::render('courses/edit', [
            'course' => $course,
            'programs' => $programs,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        $courseType = $request->input('course_type', $course->course_type);

        if ($courseType === 'guided') {
            $validated = $request->validate([
                'course_type' => ['required', 'in:guided,self_paced'],
                'title' => ['required', 'string', 'max:255'],
                'description' => ['required', 'string'],
                'duration' => ['nullable', 'string', 'max:50'],
                'target_audience' => ['required', 'string'],
                'key_learning_objectives' => ['nullable', 'array'],
                'key_learning_objectives.*' => ['string'],
                'syllabus' => ['required', 'array'],
                'syllabus.*.session' => ['required', 'integer'],
                'syllabus.*.course_topic' => ['required', 'string'],
                'syllabus.*.learnings' => ['required', 'array'],
                'syllabus.*.learnings.*' => ['string'],
                'syllabus.*.outcomes' => ['nullable', 'array'],
                'syllabus.*.outcomes.*' => ['string'],
                'syllabus.*.hours' => ['required', 'numeric'],
                'program_id' => ['nullable', 'exists:programs,id'],
                'featured' => ['nullable', 'boolean'],
            ]);

            // Clear self-paced specific fields
            $validated['topics'] = null;
        } else {
            $validated = $request->validate([
                'course_type' => ['required', 'in:guided,self_paced'],
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'topics' => ['required', 'array'],
                'topics.*.topic' => ['required', 'string'],
                'topics.*.subtopics' => ['nullable', 'array'],
                'topics.*.subtopics.*' => ['string'],
                'topics.*.duration' => ['nullable', 'string'],
                'topics.*.content' => ['required', 'string'],
                'program_id' => ['nullable', 'exists:programs,id'],
                'featured' => ['nullable', 'boolean'],
            ]);

            // Clear guided specific fields
            $validated['duration'] = null;
            $validated['target_audience'] = null;
            $validated['key_learning_objectives'] = null;
            $validated['syllabus'] = null;
        }

        $validated['featured'] = (bool) ($validated['featured'] ?? false);

        // Ensure JSON fields are properly formatted
        if (isset($validated['syllabus'])) {
            $validated['syllabus'] = array_values($validated['syllabus']);
        }
        if (isset($validated['topics'])) {
            $validated['topics'] = array_values($validated['topics']);
        }
        if (isset($validated['key_learning_objectives'])) {
            $validated['key_learning_objectives'] = array_values($validated['key_learning_objectives']);
        }

        $course->update($validated);

        return redirect()
            ->route('courses.show', $course)
            ->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()
            ->route('courses.index')
            ->with('success', 'Course deleted successfully.');
    }
}
