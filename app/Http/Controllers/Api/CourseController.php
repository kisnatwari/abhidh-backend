<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\PersonalAccessToken;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Try to get authenticated user (optional authentication)
        $user = null;
        if ($request->bearerToken()) {
            try {
                $token = PersonalAccessToken::findToken($request->bearerToken());
                if ($token) {
                    $user = $token->tokenable;
                }
            } catch (\Exception $e) {
                // Ignore auth errors for optional authentication
            }
        }
        
        $query = Course::with(['program']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Course type filter
        if ($request->has('course_type') && $request->course_type && $request->course_type !== 'all') {
            $query->where('course_type', $request->course_type);
        }

        // Program filter
        if ($request->has('program_id') && $request->program_id) {
            $query->where('program_id', $request->program_id);
        }

        // Featured filter
        if ($request->has('featured') && $request->featured !== 'all') {
            $query->where('featured', $request->featured === '1');
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $courses = $query->latest()->paginate($perPage);

        // Transform courses to hide content for unenrolled users
        $transformedCourses = $courses->items();
        
        foreach ($transformedCourses as $course) {
            // Transform program color to hex code if program exists
            if ($course->program && $course->program->color) {
                $course->program->color = $course->program->color_hex;
            }
            
            if ($course->course_type === 'self_paced') {
                $isEnrolled = false;
                if ($user) {
                    $isEnrolled = Enrollment::where('user_id', $user->id)
                        ->where('course_id', $course->id)
                        ->where('payment_verified', true)
                        ->exists();
                }
                
                if (!$isEnrolled && $course->topics) {
                    // Remove content from each topic, but keep all other fields
                    // (description, learnings, outcomes, topics, subtopics all remain)
                    $topics = $course->topics;
                    if (is_array($topics)) {
                        $topics = array_map(function ($topic) {
                            // Keep all fields except 'content'
                            if (isset($topic['content'])) {
                                unset($topic['content']);
                            }
                            return $topic;
                        }, $topics);
                        $course->setAttribute('topics', $topics);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $transformedCourses,
            'pagination' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
                'from' => $courses->firstItem(),
                'to' => $courses->lastItem(),
            ],
        ]);
    }


    /**
     * Display the specified resource.
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        // Try to get authenticated user (optional authentication)
        $user = null;
        if ($request->bearerToken()) {
            try {
                $tokenString = $request->bearerToken();
                $token = PersonalAccessToken::findToken($tokenString);
                if ($token && $token->tokenable) {
                    $user = $token->tokenable;
                }
            } catch (\Exception $e) {
                // Ignore auth errors for optional authentication
            }
        }
        
        // Load relationships
        $course->load(['program', 'enrollments.user']);
        
        // Transform program color to hex code if program exists
        if ($course->program && $course->program->color) {
            $course->program->color = $course->program->color_hex;
        }
        
        // For self-paced courses, hide content if user is not enrolled
        $isEnrolled = false;
        if ($course->course_type === 'self_paced') {
            if ($user) {
                $isEnrolled = Enrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->where('payment_verified', true)
                    ->exists();
            }
            
            if (!$isEnrolled && $course->topics) {
                // Remove content from each topic, but keep all other fields
                $topics = $course->topics;
                if (is_array($topics)) {
                    $topics = array_map(function ($topic) {
                        // Keep all fields except 'content' (description, learnings, outcomes, topics, subtopics all remain)
                        if (isset($topic['content'])) {
                            unset($topic['content']);
                        }
                        return $topic;
                    }, $topics);
                    $course->setAttribute('topics', $topics);
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    /**
     * Get programs list for course selection.
     */
    public function programs(): JsonResponse
    {
        $programs = Program::select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

}
