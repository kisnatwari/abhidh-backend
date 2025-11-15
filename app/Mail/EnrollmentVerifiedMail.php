<?php

namespace App\Mail;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EnrollmentVerifiedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Course $course,
        public Enrollment $enrollment
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your course access is ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.enrollments.verified',
            with: [
                'user' => $this->user,
                'course' => $this->course,
                'enrollment' => $this->enrollment,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

