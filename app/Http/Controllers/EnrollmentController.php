<?php

namespace App\Http\Controllers;

use App\Mail\EnrollmentVerifiedMail;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\Enrollment\EnrollmentProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    public function __construct(
        protected EnrollmentProgressService $progressService,
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Enrollment::with(['user', 'course.program', 'verifiedBy']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Payment filter
        if ($request->has('is_paid') && $request->is_paid && $request->is_paid !== 'all') {
            $query->where('is_paid', $request->is_paid === '1');
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $enrollments = $query->latest('enrollment_date')->paginate($perPage)->withQueryString();

        $users = User::select('id', 'name', 'email')->get();
        $courses = Course::with('program')->select('id', 'title', 'program_id')->get()->map(function ($course) {
            return [
                'id' => $course->id,
                'name' => $course->title,
                'program' => $course->program ? [
                    'id' => $course->program->id,
                    'name' => $course->program->name,
                ] : null,
            ];
        });

        return Inertia::render('enrollments/index', [
            'enrollments' => $enrollments,
            'users' => $users,
            'courses' => $courses,
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

    /**
     * Verify payment for an enrollment
     */
    public function verify(Request $request, Enrollment $enrollment)
    {
        $enrollment->loadMissing('user', 'course');

        $enrollment->update([
            'payment_verified' => true,
            'payment_verified_at' => now(),
            'verified_by' => $request->user()->id,
            'is_paid' => true,
            'status' => 'active',
            'enrollment_date' => now(),
        ]);

        if ($enrollment->course && $enrollment->course->course_type === 'self_paced') {
            $topics = $this->progressService->extractTopics($enrollment->course, includeContent: false);
            $this->progressService->syncTopics($enrollment, $topics);
        }

        if ($enrollment->user && $enrollment->course) {
            Mail::to($enrollment->user->email)->queue(
                new EnrollmentVerifiedMail($enrollment->user, $enrollment->course, $enrollment)
            );
        }

        return redirect()
            ->route('enrollments.index')
            ->with('success', 'Payment verified and user enrolled successfully.');
    }

    /**
     * Unverify payment for an enrollment
     */
    public function unverify(Enrollment $enrollment)
    {
        $enrollment->update([
            'payment_verified' => false,
            'payment_verified_at' => null,
            'verified_by' => null,
            'is_paid' => false,
        ]);

        return redirect()
            ->route('enrollments.index')
            ->with('success', 'Payment verification removed.');
    }
}


