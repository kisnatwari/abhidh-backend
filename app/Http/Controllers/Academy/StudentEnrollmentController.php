<?php

namespace App\Http\Controllers\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Services\Enrollment\PaymentSubmissionService;
use Throwable;

class StudentEnrollmentController extends Controller
{
    public function __construct(
        private readonly PaymentSubmissionService $paymentSubmissionService,
    ) {
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'payment_screenshot' => ['required', 'image', 'max:5120'],
        ]);

        $user = $request->user();

        $course = Course::findOrFail($validated['course_id']);

        try {
            $this->paymentSubmissionService->submit(
                $user,
                $course,
                $request->file('payment_screenshot'),
            );

            return back()->with('success', 'Payment screenshot uploaded. Our team will verify and confirm your enrollment shortly.');
        } catch (Throwable $exception) {
            report($exception);

            return back()
                ->withInput()
                ->with('error', 'We were unable to upload the screenshot right now. Please try again in a moment.');
        }
    }
}


