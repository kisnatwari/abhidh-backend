<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
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
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $validated['course_id'])
            ->first();

        // Handle file upload
        if ($request->hasFile('payment_screenshot')) {
            // Delete old screenshot if exists
            if ($enrollment && $enrollment->payment_screenshot_path) {
                Storage::disk('public')->delete($enrollment->payment_screenshot_path);
            }

            $path = $request->file('payment_screenshot')->store('payments', 'public');
            $validated['payment_screenshot_path'] = $path;
        }

        // Create or update enrollment
        if ($enrollment) {
            // Update existing enrollment
            $enrollment->update([
                'payment_screenshot_path' => $validated['payment_screenshot_path'],
                'payment_verified' => false, // Reset verification when new screenshot is uploaded
                'payment_verified_at' => null,
                'verified_by' => null,
                'is_paid' => false,
            ]);
        } else {
            // Create new enrollment
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $validated['course_id'],
                'payment_screenshot_path' => $validated['payment_screenshot_path'],
                'payment_verified' => false,
                'is_paid' => false,
                'status' => 'active',
                'enrollment_date' => now(),
            ]);
        }

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

