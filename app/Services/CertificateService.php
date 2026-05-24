<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\QuizAttempt;
use App\Models\User;
use Carbon\Carbon;

class CertificateService
{
    private const FILLER_WORDS = ['in', 'of', 'the', 'a', 'an', 'and', 'or', 'for', 'with', 'at', 'by', 'to', 'on'];

    public function getInitials(string $courseName): string
    {
        $words = preg_split('/\s+/', trim($courseName));
        $initials = '';
        foreach ($words as $word) {
            if ($word !== '' && !in_array(strtolower($word), self::FILLER_WORDS)) {
                $initials .= strtoupper($word[0]);
            }
        }
        return $initials ?: 'CRT';
    }

    public function generateNumber(Course $course, Carbon $date): string
    {
        $initials = $this->getInitials($course->title);
        $datePart = $date->format('dmY'); // DDMMYYYY
        $count = Certificate::where('course_id', $course->id)->count() + 1;
        $countPart = str_pad($count, 2, '0', STR_PAD_LEFT);
        return $initials . $datePart . $countPart;
    }

    public function generate(User $user, Course $course, QuizAttempt $attempt): Certificate
    {
        $existing = Certificate::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();
        if ($existing) {
            return $existing;
        }

        $issuedAt = now();
        $number = $this->generateNumber($course, $issuedAt);

        return Certificate::create([
            'user_id'         => $user->id,
            'course_id'       => $course->id,
            'quiz_attempt_id' => $attempt->id,
            'certificate_number' => $number,
            'issued_at'       => $issuedAt,
        ]);
    }
}
