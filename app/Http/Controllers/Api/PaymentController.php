<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\Enrollment\PaymentSubmissionService;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentSubmissionService $paymentSubmissionService,
    ) {
    }

    /**
     * Submit payment screenshot for a course enrollment
     */
    public function submitPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'payment_screenshot' => ['required', 'image', 'max:5120'], // 5MB max
        ]);

        $user = $request->user();

        // Check if enrollment already exists
        $course = Course::findOrFail($validated['course_id']);
        $enrollment = $this->paymentSubmissionService->submit(
            $user,
            $course,
            $request->file('payment_screenshot')
        );

        return response()->json([
            'success' => true,
            'message' => 'Payment screenshot submitted successfully. Waiting for admin verification.',
            'data' => [
                'enrollment_id' => $enrollment->id,
                'course_id' => $enrollment->course_id,
                'payment_verified' => $enrollment->payment_verified,
            ],
        ]);
    }
}

