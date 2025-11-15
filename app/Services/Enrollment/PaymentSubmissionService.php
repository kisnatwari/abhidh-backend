<?php

namespace App\Services\Enrollment;

use App\Mail\EnrollmentPendingMail;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class PaymentSubmissionService
{
    /**
     * @throws \Throwable
     */
    public function submit(User $user, Course $course, UploadedFile $paymentScreenshot): Enrollment
    {
        return DB::transaction(function () use ($user, $course, $paymentScreenshot) {
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->lockForUpdate()
                ->first();

            if ($enrollment && $enrollment->payment_screenshot_path) {
                Storage::disk('public')->delete($enrollment->payment_screenshot_path);
            }

            $path = $paymentScreenshot->store('payments', 'public');

            if ($enrollment) {
                $enrollment->update([
                    'payment_screenshot_path' => $path,
                    'payment_verified' => false,
                    'payment_verified_at' => null,
                    'verified_by' => null,
                    'is_paid' => false,
                ]);

                $enrollment->refresh();

                DB::afterCommit(function () use ($user, $course, $enrollment) {
                    Mail::to($user->email)->queue(new EnrollmentPendingMail($user, $course, $enrollment));
                });

                return $enrollment;
            }

            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'payment_screenshot_path' => $path,
                'payment_verified' => false,
                'payment_verified_at' => null,
                'verified_by' => null,
                'is_paid' => false,
                'status' => 'active',
                'enrollment_date' => now(),
            ]);

            DB::afterCommit(function () use ($user, $course, $enrollment) {
                Mail::to($user->email)->queue(new EnrollmentPendingMail($user, $course, $enrollment));
            });

            return $enrollment;
        });
    }
}

