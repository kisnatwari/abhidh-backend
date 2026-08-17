<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function start(Course $course)
    {
        // Ensure it's self-paced
        if ($course->course_type !== 'self_paced') {
            abort(403, 'Quizzes are only available for self-paced courses.');
        }

        // Check enrollment (assuming enrollment logic exists)
        $enrollment = $course->enrollments()->where('user_id', Auth::id())->first();
        if (!$enrollment) {
            abort(403, 'You must be enrolled in this course to take the quiz.');
        }

        // Block re-attempt if the student already has a certificate for this course
        $existingCert = Certificate::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();
        if ($existingCert) {
            return redirect()->route('academy.dashboard.enrollments.show', $enrollment->id)
                ->with('info', 'You have already earned a certificate for this course.');
        }

        $quizzes = Quiz::with('options')
            ->where('course_id', $course->id)
            ->get();

        if ($quizzes->isEmpty()) {
            return back()->with('error', 'No quiz questions available for this course yet.');
        }

        // Never leak the correct answer to the client while the quiz is in progress.
        $quizzes->each(fn ($quiz) => $quiz->options->makeHidden('is_correct'));

        // Create an attempt record
        $attempt = QuizAttempt::create([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'total_questions' => $quizzes->count(),
            'status' => 'ongoing',
            'started_at' => now(),
        ]);

        return Inertia::render('user/courses/quizzes/play', [
            'course' => $course,
            'quizzes' => $quizzes,
            'attempt' => $attempt,
            'time_limit' => $course->quiz_time_limit_minutes,
        ]);
    }

    public function submit(Request $request)
    {
        $validated = $request->validate([
            'attempt_id' => 'required|exists:quiz_attempts,id',
            'answers' => 'required|array',
            'answers.*' => 'array', // multiple selections allowed
        ]);

        $attempt = QuizAttempt::findOrFail($validated['attempt_id']);
        if ($attempt->status !== 'ongoing') {
            return back()->withErrors(['error' => 'This attempt has already been submitted or timed out.']);
        }

        $quizzes = Quiz::with('options')->where('course_id', $attempt->course_id)->get();
        $correctCount = 0;

        foreach ($quizzes as $quiz) {
            $userSelectedOptionIds = array_map('intval', $validated['answers'][$quiz->id] ?? []);
            $correctOptionIds = $quiz->options->where('is_correct', true)->pluck('id')->map(fn ($id) => (int) $id)->toArray();

            // Handle multiple correct options logic:
            // All selected must be correct, and all correct must be selected.
            sort($userSelectedOptionIds);
            sort($correctOptionIds);

            if ($userSelectedOptionIds === $correctOptionIds) {
                $correctCount++;
            }
        }

        $scorePercentage = ($correctCount / $quizzes->count()) * 100;

        $attempt->update([
            'correct_answers' => $correctCount,
            'score_percentage' => $scorePercentage,
            'completed_at' => now(),
            'status' => 'completed',
        ]);

        return redirect()->route('academy.dashboard.quiz.result', $attempt->id);
    }

    public function result(QuizAttempt $attempt)
    {
        if ($attempt->user_id !== Auth::id()) {
            abort(403);
        }

        $course = Course::findOrFail($attempt->course_id);
        
        $enrollment = Auth::user()->enrollments()->where('course_id', $course->id)->first();
        $passMark = $course->quiz_pass_marks ?? 40;
        $passed = $attempt->score_percentage >= $passMark;

        $certificate = Certificate::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        return Inertia::render('user/courses/quizzes/result', [
            'attempt' => $attempt,
            'course' => $course,
            'passed' => $passed,
            'pass_mark' => $passMark,
            'enrollment_id' => $enrollment?->id,
            'certificate' => $certificate ? [
                'id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
            ] : null,
        ]);
    }
}
