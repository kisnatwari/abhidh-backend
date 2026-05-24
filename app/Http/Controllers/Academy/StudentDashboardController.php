<?php

namespace App\Http\Controllers\Academy;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Course;
use App\Services\Enrollment\EnrollmentProgressService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function __construct(
        protected EnrollmentProgressService $progressService,
    ) {
    }

    public function overview(Request $request): Response
    {
        $user = $request->user();

        $enrollmentsQuery = Enrollment::with(['course.program', 'topicProgress'])
            ->where('user_id', $user->id);

        $overviewStats = [
            'active' => (clone $enrollmentsQuery)->where('status', 'active')->count(),
            'completed' => (clone $enrollmentsQuery)->where('status', 'completed')->count(),
            'pendingPayments' => (clone $enrollmentsQuery)
                ->where('payment_verified', false)
                ->whereNotNull('payment_screenshot_path')
                ->count(),
        ];

        $recentEnrollments = $enrollmentsQuery
            ->latest('created_at')
            ->take(5)
            ->get()
            ->map(function (Enrollment $enrollment) {
                $progressSummary = null;

                if ($enrollment->course?->course_type === 'self_paced') {
                    $topics = $this->progressService->extractTopics($enrollment->course, includeContent: false);
                    $this->progressService->syncTopics($enrollment, $topics);
                    $progressCollection = $enrollment->topicProgress()->get();
                    $summary = $this->progressService->summarize($progressCollection, count($topics), $topics);
                    $nextTopic = null;

                    if ($summary['next_topic_index'] !== null && isset($topics[$summary['next_topic_index']])) {
                        $nextTopic = [
                            'order' => $topics[$summary['next_topic_index']]['order'],
                            'title' => $topics[$summary['next_topic_index']]['title'],
                        ];
                    }

                    $progressSummary = [
                        'completedCount' => $summary['completed_count'],
                        'topicCount' => $summary['topic_count'],
                        'subtopicCount' => $summary['subtopic_count'] ?? 0,
                        'percentComplete' => $summary['percent_complete'],
                        'nextTopic' => $nextTopic,
                        'nextSubtopicIndex' => $summary['next_subtopic_index'] ?? null,
                    ];
                }

                return [
                    'id' => $enrollment->id,
                    'courseTitle' => $enrollment->course?->title,
                    'status' => $enrollment->status,
                    'paymentVerified' => (bool) $enrollment->payment_verified,
                    'enrollmentDate' => optional($enrollment->created_at)->toDateTimeString(),
                    'programName' => $enrollment->course?->program?->name,
                    'progress' => $progressSummary,
                ];
            })
            ->values();

        return Inertia::render('academy/dashboard/index', [
            'stats' => $overviewStats,
            'recentEnrollments' => $recentEnrollments,
        ]);
    }

    public function enrollments(Request $request): Response
    {
        $user = $request->user();

        $enrollmentModels = Enrollment::with(['course.program', 'topicProgress'])
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->get();

        $certificates = Certificate::where('user_id', $user->id)
            ->get()
            ->keyBy('course_id');

        $enrollments = $enrollmentModels
            ->map(function (Enrollment $enrollment) use ($certificates) {
                $progressSummary = null;

                if ($enrollment->course?->course_type === 'self_paced') {
                    $topics = $this->progressService->extractTopics($enrollment->course, includeContent: false);
                    $this->progressService->syncTopics($enrollment, $topics);
                    $progressCollection = $enrollment->topicProgress()->get();
                    $summary = $this->progressService->summarize($progressCollection, count($topics), $topics);
                    $nextTopic = null;

                    if ($summary['next_topic_index'] !== null && isset($topics[$summary['next_topic_index']])) {
                        $nextTopic = [
                            'order' => $topics[$summary['next_topic_index']]['order'],
                            'title' => $topics[$summary['next_topic_index']]['title'],
                        ];
                    }

                    $progressSummary = [
                        'completedCount' => $summary['completed_count'],
                        'topicCount' => $summary['topic_count'],
                        'subtopicCount' => $summary['subtopic_count'] ?? 0,
                        'percentComplete' => $summary['percent_complete'],
                        'nextTopic' => $nextTopic,
                        'nextSubtopicIndex' => $summary['next_subtopic_index'] ?? null,
                    ];
                }

                $cert = $certificates->get($enrollment->course?->id);

                return [
                    'id' => $enrollment->id,
                    'courseTitle' => $enrollment->course?->title,
                    'courseType' => $enrollment->course?->course_type_label,
                    'programName' => $enrollment->course?->program?->name,
                    'status' => $enrollment->status,
                    'paymentStatus' => $enrollment->is_paid ? 'Paid' : 'Unpaid',
                    'paymentVerified' => (bool) $enrollment->payment_verified,
                    'enrollmentDate' => optional($enrollment->created_at)->toDateTimeString(),
                    'progress' => $progressSummary,
                    'certificate' => $cert ? [
                        'id' => $cert->id,
                        'certificateNumber' => $cert->certificate_number,
                        'issuedAt' => $cert->issued_at->format('jS M, Y'),
                        'downloadUrl' => route('academy.certificate.download', $cert->id),
                    ] : null,
                ];
            })
            ->values();

        $enrolledCourseIds = $enrollmentModels
            ->pluck('course.id')
            ->filter()
            ->unique()
            ->values();

        $availableCourses = Course::with('program')
            ->when($enrolledCourseIds->isNotEmpty(), fn($query) => $query->whereNotIn('id', $enrolledCourseIds))
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(fn(Course $course) => $this->courseCatalogResource($course))
            ->values();

        return Inertia::render('academy/dashboard/enrollments/index', [
            'enrollments' => $enrollments,
            'availableCourses' => $availableCourses,
        ]);
    }

    public function showEnrollment(Request $request, Enrollment $enrollment): Response
    {
        $user = $request->user();

        abort_if((int) $enrollment->user_id !== (int) $user->id, 404);

        $enrollment->load(['course.program']);

        $cert = Certificate::where('user_id', $user->id)
            ->where('course_id', $enrollment->course_id)
            ->first();

        return Inertia::render('academy/dashboard/enrollments/show', [
            'enrollment' => [
                'id' => $enrollment->id,
                'status' => $enrollment->status,
                'paymentVerified' => (bool) $enrollment->payment_verified,
                'isPaid' => (bool) $enrollment->is_paid,
                'enrollmentDate' => optional($enrollment->enrollment_date ?? $enrollment->created_at)->toDateTimeString(),
                'course' => $this->courseStudyResource($enrollment->course, $enrollment),
                'certificate' => $cert ? [
                    'id' => $cert->id,
                    'certificateNumber' => $cert->certificate_number,
                    'issuedAt' => $cert->issued_at->format('jS M, Y'),
                    'downloadUrl' => route('academy.certificate.download', $cert->id),
                ] : null,
            ],
        ]);
    }

    public function profile(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('academy/dashboard/profile/index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user->update($validated);

        return redirect()
            ->route('academy.dashboard.profile')
            ->with('success', 'Profile updated successfully.');
    }

    public function markTopicStarted(Request $request, Enrollment $enrollment, int $topic): RedirectResponse
    {
        $user = $request->user();
        abort_if((int) $enrollment->user_id !== (int) $user->id, 404);

        $course = $enrollment->course()->firstOrFail();
        $this->ensureSelfPacedAccess($enrollment, $course);

        $topics = $this->progressService->extractTopics($course, includeContent: false);
        abort_if(!isset($topics[$topic]), 404);

        $this->progressService->syncTopics($enrollment, $topics);
        $this->progressService->markTopicStarted($enrollment, $topic);

        return redirect()->back()->with('progressUpdated', true);
    }

    public function markTopicCompleted(Request $request, Enrollment $enrollment, int $topic): RedirectResponse
    {
        $user = $request->user();
        abort_if((int) $enrollment->user_id !== (int) $user->id, 404);

        $course = $enrollment->course()->firstOrFail();
        $this->ensureSelfPacedAccess($enrollment, $course);

        $topics = $this->progressService->extractTopics($course, includeContent: false);
        abort_if(!isset($topics[$topic]), 404);

        $this->progressService->syncTopics($enrollment, $topics);
        $this->progressService->markTopicCompleted($enrollment, $topic);

        return redirect()->back()->with('progressUpdated', true);
    }

    public function markSubtopicStarted(Request $request, Enrollment $enrollment, int $topic, int $subtopic): RedirectResponse
    {
        $user = $request->user();
        abort_if((int) $enrollment->user_id !== (int) $user->id, 404);

        $course = $enrollment->course()->firstOrFail();
        $this->ensureSelfPacedAccess($enrollment, $course);

        $topics = $this->progressService->extractTopics($course, includeContent: false);
        abort_if(!isset($topics[$topic]), 404);
        abort_if(!isset($topics[$topic]['subtopics'][$subtopic]), 404);

        $this->progressService->syncTopics($enrollment, $topics);
        $this->progressService->markSubtopicStarted($enrollment, $topic, $subtopic);

        return redirect()->back()->with('progressUpdated', true);
    }

    public function markSubtopicCompleted(Request $request, Enrollment $enrollment, int $topic, int $subtopic): RedirectResponse
    {
        $user = $request->user();
        abort_if((int) $enrollment->user_id !== (int) $user->id, 404);

        $course = $enrollment->course()->firstOrFail();
        $this->ensureSelfPacedAccess($enrollment, $course);

        $topics = $this->progressService->extractTopics($course, includeContent: false);
        abort_if(!isset($topics[$topic]), 404);
        abort_if(!isset($topics[$topic]['subtopics'][$subtopic]), 404);

        $this->progressService->syncTopics($enrollment, $topics);
        $this->progressService->markSubtopicCompleted($enrollment, $topic, $subtopic);

        return redirect()->back()->with('progressUpdated', true);
    }

    protected function courseStudyResource(?Course $course, ?Enrollment $enrollment = null): ?array
    {
        if (!$course) {
            return null;
        }

        $course->loadMissing('program');

        $contentLocked = $enrollment
            && $course->course_type === 'self_paced'
            && (!(bool) $enrollment->payment_verified || !(bool) $enrollment->is_paid);

        $base = [
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'duration' => $course->duration,
            'grade' => $course->grade,
            'courseType' => $course->course_type,
            'courseTypeLabel' => $course->course_type_label,
            'keyLearningObjectives' => $course->key_learning_objectives ?: [],
            'contentLocked' => $contentLocked,
            'lockReason' => $contentLocked ? 'Payment pending verification' : null,
            'program' => $course->program ? [
                'id' => $course->program->id,
                'name' => $course->program->name,
                'category_label' => $course->program->category_label,
                'color' => $course->program->color_hex,
            ] : null,
        ];

        if ($course->course_type === 'self_paced') {
            $topics = $this->progressService->extractTopics($course, includeContent: !$contentLocked);
            $progressPayload = null;
            $summaryPayload = null;

            if ($enrollment) {
                $this->progressService->syncTopics($enrollment, $topics);
                $progressCollection = $enrollment->topicProgress()->get();
                $summary = $this->progressService->summarize($progressCollection, count($topics), $topics);

                // Build progress payload for topics and subtopics
                $progressPayload = collect($topics)->map(function (array $topic) use ($progressCollection) {
                    $topicProgress = $progressCollection->firstWhere(function ($p) use ($topic) {
                        return $p->topic_index === $topic['order'] && $p->subtopic_index === null;
                    });

                    $subtopicsProgress = collect($topic['subtopics'] ?? [])->map(function ($subtopic, int $subtopicIndex) use ($progressCollection, $topic) {
                        $subtopicProgress = $progressCollection->firstWhere(function ($p) use ($topic, $subtopicIndex) {
                            return $p->topic_index === $topic['order'] && $p->subtopic_index === $subtopicIndex;
                        });

                        return [
                            'index' => $subtopicIndex,
                            'status' => $subtopicProgress?->status ?? 'not_started',
                            'lastViewedAt' => $subtopicProgress?->last_viewed_at?->toDateTimeString(),
                            'completedAt' => $subtopicProgress?->completed_at?->toDateTimeString(),
                        ];
                    })->all();

                    return [
                        'order' => $topic['order'],
                        'status' => $topicProgress?->status ?? 'not_started',
                        'lastViewedAt' => $topicProgress?->last_viewed_at?->toDateTimeString(),
                        'completedAt' => $topicProgress?->completed_at?->toDateTimeString(),
                        'subtopics' => $subtopicsProgress,
                    ];
                })->all();

                $nextTopic = null;
                if ($summary['next_topic_index'] !== null && isset($topics[$summary['next_topic_index']])) {
                    $nextTopic = [
                        'order' => $topics[$summary['next_topic_index']]['order'],
                        'title' => $topics[$summary['next_topic_index']]['title'],
                    ];
                }

                $summaryPayload = [
                    'completedCount' => $summary['completed_count'],
                    'topicCount' => $summary['topic_count'],
                    'subtopicCount' => $summary['subtopic_count'] ?? 0,
                    'percentComplete' => $summary['percent_complete'],
                    'nextTopic' => $nextTopic,
                    'nextSubtopicIndex' => $summary['next_subtopic_index'] ?? null,
                ];
            }

            return array_merge($base, [
                'topics' => $topics,
                'progress' => [
                    'items' => $progressPayload,
                    'summary' => $summaryPayload,
                ],
            ]);
        }

        $syllabus = collect($course->syllabus ?: [])
            ->map(function ($entry, int $index) {
                if (!is_array($entry)) {
                    return null;
                }

                $learnings = collect($entry['learnings'] ?? [])
                    ->filter(fn($value) => is_string($value) && trim($value) !== '')
                    ->values()
                    ->all();

                $activities = collect($entry['activities'] ?? [])
                    ->filter(fn($value) => is_string($value) && trim($value) !== '')
                    ->values()
                    ->all();

                return [
                    'id' => $entry['session'] ?? $index + 1,
                    'session' => $entry['session'] ?? $index + 1,
                    'course_topic' => $entry['course_topic'] ?? $entry['title'] ?? null,
                    'hours' => $entry['hours'] ?? null,
                    'learnings' => $learnings,
                    'activities' => $activities,
                    'description' => $entry['description'] ?? null,
                ];
            })
            ->filter()
            ->values()
            ->all();

        return array_merge($base, [
            'syllabus' => $syllabus,
        ]);
    }

    protected function courseCatalogResource(Course $course): array
    {
        $course->loadMissing('program');

        return [
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'courseType' => $course->course_type,
            'courseTypeLabel' => $course->course_type_label,
            'duration' => $course->duration,
            'grade' => $course->grade,
            'featured' => (bool) $course->featured,
            'program' => $course->program ? [
                'id' => $course->program->id,
                'name' => $course->program->name,
                'color' => $course->program->color_hex,
            ] : null,
        ];
    }

    protected function ensureSelfPacedAccess(Enrollment $enrollment, Course $course): void
    {
        abort_if($course->course_type !== 'self_paced', 404);

        $contentLocked = (!(bool) $enrollment->payment_verified) || (!(bool) $enrollment->is_paid);
        abort_if($contentLocked, 403);
    }
}

