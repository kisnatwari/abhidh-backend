<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\ContactUs;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Gallery;
use App\Models\Program;
use App\Models\Team;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Total counts
        $stats = [
            'total_blogs' => Blog::count(),
            'published_blogs' => Blog::where('is_published', true)->count(),
            'total_courses' => Course::count(),
            'guided_courses' => Course::where('course_type', 'guided')->count(),
            'self_paced_courses' => Course::where('course_type', 'self_paced')->count(),
            'total_programs' => Program::count(),
            'total_enrollments' => Enrollment::count(),
            'verified_enrollments' => Enrollment::where('payment_verified', true)->count(),
            'pending_verification' => Enrollment::where('payment_verified', false)
                ->whereNotNull('payment_screenshot_path')
                ->count(),
            'total_trainers' => Trainer::count(),
            'total_teams' => Team::count(),
            'total_galleries' => Gallery::count(),
            'total_users' => User::count(),
            'total_contacts' => ContactUs::count(),
            'pending_contacts' => ContactUs::where('is_replied', false)->count(),
        ];

        // Recent enrollments with pending verification
        $recent_pending_enrollments = Enrollment::with(['user', 'course.program'])
            ->where('payment_verified', false)
            ->whereNotNull('payment_screenshot_path')
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'user_name' => $enrollment->user->name ?? 'N/A',
                    'course_title' => $enrollment->course->title ?? 'N/A',
                    'program_name' => $enrollment->course->program->name ?? 'N/A',
                    'submitted_at' => $enrollment->updated_at?->format('M d, Y H:i'),
                    'payment_screenshot_url' => $enrollment->payment_screenshot_url,
                ];
            });

        // Recent enrollments (all)
        $recent_enrollments = Enrollment::with(['user', 'course.program'])
            ->latest('enrollment_date')
            ->limit(5)
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'user_name' => $enrollment->user->name ?? 'N/A',
                    'course_title' => $enrollment->course->title ?? 'N/A',
                    'program_name' => $enrollment->course->program->name ?? 'N/A',
                    'status' => $enrollment->payment_verified ? 'Verified' : 'Pending',
                    'enrollment_date' => $enrollment->enrollment_date?->format('M d, Y'),
                ];
            });

        // Recent blogs
        $recent_blogs = Blog::latest('created_at')
            ->limit(5)
            ->get()
            ->map(function ($blog) {
                return [
                    'id' => $blog->id,
                    'title' => $blog->title,
                    'is_published' => $blog->is_published,
                    'option' => $blog->option,
                    'created_at' => $blog->created_at->format('M d, Y'),
                ];
            });

        // Recent courses
        $recent_courses = Course::with('program')
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'course_type' => $course->course_type,
                    'program_name' => $course->program->name ?? 'N/A',
                    'created_at' => $course->created_at->format('M d, Y'),
                ];
            });

        // Enrollment statistics by month (last 6 months)
        $enrollments_by_month = Enrollment::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date('M Y', strtotime($item->month . '-01')),
                    'count' => $item->count,
                ];
            });

        // Course enrollment counts (top 5)
        $popular_courses = Course::withCount('enrollments')
            ->with('program')
            ->orderBy('enrollments_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'program_name' => $course->program->name ?? 'N/A',
                    'enrollments_count' => $course->enrollments_count,
                ];
            });

        // Recent contact submissions
        $recent_contacts = ContactUs::latest('created_at')
            ->limit(5)
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'name' => $contact->name ?? 'N/A',
                    'email' => $contact->email,
                    'subject' => $contact->subject ?? 'No Subject',
                    'is_replied' => $contact->is_replied,
                    'created_at' => $contact->created_at->format('M d, Y H:i'),
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recent_pending_enrollments' => $recent_pending_enrollments,
            'recent_enrollments' => $recent_enrollments,
            'recent_blogs' => $recent_blogs,
            'recent_courses' => $recent_courses,
            'enrollments_by_month' => $enrollments_by_month,
            'popular_courses' => $popular_courses,
            'recent_contacts' => $recent_contacts,
        ]);
    }
}
