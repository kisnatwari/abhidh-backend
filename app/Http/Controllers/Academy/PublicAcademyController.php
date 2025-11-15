<?php

namespace App\Http\Controllers\Academy;

use App\Http\Controllers\Controller;
use App\Mail\ContactNotificationMail;
use App\Models\Blog;
use App\Models\ContactUs;
use App\Models\Course;
use App\Models\Gallery;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PublicAcademyController extends Controller
{
    public function index(): Response
    {
        $programs = Program::withCount('courses')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (Program $program) => $this->programResource($program));

        $featuredCourses = Course::with('program')
            ->where('featured', true)
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (Course $course) => $this->courseResource($course));

        if ($featuredCourses->isEmpty()) {
            $featuredCourses = Course::with('program')
                ->latest()
                ->take(6)
                ->get()
                ->map(fn (Course $course) => $this->courseResource($course));
        }

        $blogPosts = Blog::where('is_published', true)
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(fn (Blog $blog) => $this->blogResource($blog));

        $trainers = Trainer::latest()
            ->take(6)
            ->get()
            ->map(fn (Trainer $trainer) => $this->trainerResource($trainer));

        return Inertia::render('academy/home', [
            'programs' => $programs,
            'featuredCourses' => $featuredCourses,
            'blogPosts' => $blogPosts,
            'trainers' => $trainers,
        ]);
    }

    public function programs(): Response
    {
        $programs = Program::withCount('courses')
            ->orderBy('name')
            ->get()
            ->map(fn (Program $program) => $this->programResource($program));

        return Inertia::render('academy/programs/index', [
            'programs' => $programs,
        ]);
    }

    public function selfPacedCourses(): Response
    {
        $courses = Course::with('program')
            ->where('course_type', 'self_paced')
            ->latest()
            ->get()
            ->map(fn (Course $course) => $this->courseResource($course));

        return Inertia::render('academy/self-paced/index', [
            'courses' => $courses,
        ]);
    }

    public function courses(): Response
    {
        $programGroups = Program::withCount('courses')
            ->with(['courses' => function ($query) {
                $query->with('program')
                    ->orderBy('title');
            }])
            ->orderBy('name')
            ->get()
            ->map(function (Program $program) {
                $courses = $program->courses
                    ->map(fn (Course $course) => $this->courseResource($course))
                    ->filter()
                    ->values();

                if ($courses->isEmpty()) {
                    return null;
                }

                return [
                    'program' => $this->programResource($program),
                    'courses' => $courses,
                ];
            })
            ->filter()
            ->values();

        $standaloneCourses = Course::with('program')
            ->whereNull('program_id')
            ->latest()
            ->get()
            ->map(fn (Course $course) => $this->courseResource($course));

        return Inertia::render('academy/courses/index', [
            'programGroups' => $programGroups,
            'standaloneCourses' => $standaloneCourses,
        ]);
    }

    public function selfPacedCourse(Request $request, Course $course): Response
    {
        abort_unless($course->course_type === 'self_paced', 404);

        return $this->showCourse($request, $course);
    }

    public function galleries(): Response
    {
        $galleries = Gallery::with('photos')
            ->latest()
            ->get()
            ->map(fn (Gallery $gallery) => $this->galleryResource($gallery));

        return Inertia::render('academy/galleries/index', [
            'galleries' => $galleries,
        ]);
    }

    public function showGallery(Gallery $gallery): Response
    {
        $gallery->load('photos');

        $related = Gallery::with('photos')
            ->where('id', '!=', $gallery->id)
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (Gallery $item) => $this->galleryResource($item));

        return Inertia::render('academy/galleries/show', [
            'gallery' => $this->galleryResource($gallery),
            'relatedGalleries' => $related,
        ]);
    }

    public function blog(): Response
    {
        $posts = Blog::where('is_published', true)
            ->latest('published_at')
            ->paginate(9)
            ->through(fn (Blog $blog) => $this->blogResource($blog));

        return Inertia::render('academy/blog/index', [
            'posts' => $posts,
        ]);
    }

    public function blogShow(Blog $blog): Response
    {
        abort_unless($blog->is_published, 404);

        return Inertia::render('academy/blog/show', [
            'post' => $this->blogResource($blog->refresh()),
        ]);
    }

    public function contact(): Response
    {
        $programs = Program::orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Program $program) => [
                'id' => $program->id,
                'name' => $program->name,
            ]);

        return Inertia::render('academy/contact', [
            'programOptions' => $programs,
        ]);
    }

    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10'],
            'program' => ['nullable', 'string', 'max:255'],
        ]);

        $contact = ContactUs::create([
            'source' => 'academy',
            'name' => $validated['name'] ?? null,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'subject' => $validated['subject'] ?? 'General inquiry',
            'message' => $validated['message'],
            'courses' => $validated['program'] ?? null,
        ]);

        try {
            Mail::to('bcrypt81@gmail.com')->queue(
                new ContactNotificationMail($contact)
            );
        } catch (\Throwable $th) {
            Log::error('Failed to send public contact notification: '.$th->getMessage());
        }

        return redirect()
            ->route('academy.contact')
            ->with('success', 'Thank you for reaching out. We will get back to you shortly.');
    }

    public function userDashboard(): Response
    {
        $programCount = Program::count();
        $courseCount = Course::count();
        $selfPacedCount = Course::where('course_type', 'self_paced')->count();
        $blogCount = Blog::where('is_published', true)->count();

        $recentPrograms = Program::withCount('courses')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn (Program $program) => $this->programResource($program));

        $popularCourses = Course::with('program')
            ->where('course_type', 'self_paced')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn (Course $course) => $this->courseResource($course));

        return Inertia::render('academy/dashboard', [
            'stats' => [
                'programs' => $programCount,
                'courses' => $courseCount,
                'selfPacedCourses' => $selfPacedCount,
                'blogPosts' => $blogCount,
            ],
            'recentPrograms' => $recentPrograms,
            'popularCourses' => $popularCourses,
        ]);
    }

    /**
     * Transform a program model for the frontend.
     */
    protected function programResource(Program $program): array
    {
        return [
            'id' => $program->id,
            'name' => $program->name,
            'description' => $program->description,
            'category' => $program->category,
            'category_label' => $program->category_label,
            'color' => $program->color_hex,
            'courses_count' => $program->courses_count ?? $program->courses()->count(),
            'updated_at' => optional($program->updated_at)->toDateTimeString(),
        ];
    }

    /**
     * Transform a course model for the frontend.
     */
    protected function courseResource(Course $course): array
    {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'duration' => $course->duration,
            'course_type' => $course->course_type,
            'course_type_label' => $course->course_type_label,
            'featured' => $course->featured,
            'program' => $course->program ? [
                'id' => $course->program->id,
                'name' => $course->program->name,
                'color' => $course->program->color_hex,
            ] : null,
            'topics' => $course->course_type === 'self_paced'
                ? collect($course->topics ?: [])
                    ->map(function ($topic) {
                        if (is_string($topic)) {
                            return ['label' => $topic];
                        }

                        if (is_array($topic)) {
                            return [
                                'label' => $topic['topic'] ?? $topic['title'] ?? null,
                                'duration' => $topic['duration'] ?? null,
                            ];
                        }

                        return null;
                    })
                    ->filter()
                    ->values()
                    ->all()
                : [],
            'key_learning_objectives' => $course->key_learning_objectives ?: [],
            'updated_at' => optional($course->updated_at)->toDateTimeString(),
        ];
    }

    protected function courseDetailResource(Course $course, ?Enrollment $enrollment = null): array
    {
        $program = $course->program
            ? [
                'id' => $course->program->id,
                'name' => $course->program->name,
                'category_label' => $course->program->category_label,
                'color' => $course->program->color_hex,
            ]
            : null;

        $topics = [];

        if ($course->course_type === 'self_paced') {
            $topics = collect($course->topics ?: [])
                ->map(function ($topic) {
                    if (is_string($topic)) {
                        return [
                            'label' => $topic,
                            'duration' => null,
                            'subtopics' => [],
                        ];
                    }

                    if (is_array($topic)) {
                        return [
                            'label' => $topic['topic'] ?? $topic['title'] ?? null,
                            'duration' => $topic['duration'] ?? null,
                            'subtopics' => $topic['subtopics'] ?? [],
                        ];
                    }

                    return null;
                })
                ->filter()
                ->values()
                ->all();
        }

        return [
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'duration' => $course->duration,
            'course_type' => $course->course_type,
            'course_type_label' => $course->course_type_label,
            'featured' => $course->featured,
            'topics' => $topics,
            'syllabus' => $course->course_type === 'guided' ? $course->syllabus ?: [] : [],
            'key_learning_objectives' => $course->key_learning_objectives ?: [],
            'program' => $program,
            'enrollment' => $enrollment ? [
                'id' => $enrollment->id,
                'status' => $enrollment->status,
                'is_paid' => (bool) $enrollment->is_paid,
                'payment_verified' => (bool) $enrollment->payment_verified,
                'payment_verified_at' => optional($enrollment->payment_verified_at)->toDateTimeString(),
                'payment_screenshot_url' => $enrollment->payment_screenshot_url,
                'submitted_at' => optional($enrollment->updated_at ?? $enrollment->created_at)->toDateTimeString(),
            ] : null,
        ];
    }

    public function showCourse(Request $request, Course $course): Response
    {
        $course->load('program');

        $user = $request->user();

        $enrollment = null;

        if ($user && $course->course_type === 'self_paced') {
            $enrollment = Enrollment::with('course.program')
                ->where('course_id', $course->id)
                ->where('user_id', $user->id)
                ->latest()
                ->first();
        }

        return Inertia::render('academy/courses/show', [
            'course' => $this->courseDetailResource($course, $enrollment),
        ]);
    }

    /**
     * Transform a blog model for the frontend.
     */
    protected function blogResource(Blog $blog): array
    {
        return [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'option' => $blog->option,
            'content' => $blog->content,
            'published_at' => optional($blog->published_at)->toDateTimeString(),
            'image_url' => $blog->image_url,
        ];
    }

    /**
     * Transform a trainer model for the frontend.
     */
    protected function trainerResource(Trainer $trainer): array
    {
        return [
            'id' => $trainer->id,
            'name' => $trainer->name,
            'expertise' => $trainer->expertise,
            'years_of_experience' => $trainer->years_of_experience,
            'photo_url' => $trainer->photo_url,
        ];
    }

    /**
     * Transform a gallery model for the frontend.
     */
    protected function galleryResource(Gallery $gallery): array
    {
        return [
            'id' => $gallery->id,
            'title' => $gallery->title,
            'description' => $gallery->description,
            'option' => $gallery->option,
            'media_type' => $gallery->media_type,
            'youtube_url' => $gallery->youtube_url,
            'created_at' => optional($gallery->created_at)->toDateTimeString(),
            'photos' => $gallery->photos->map(fn ($photo) => [
                'id' => $photo->id,
                'photo_path' => $photo->photo_path,
                'photo_url' => $photo->photo_url,
                'caption' => $photo->caption,
            ])->values()->all(),
        ];
    }
}

