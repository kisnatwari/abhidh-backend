<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\QuizAttempt;
use App\Services\CertificateService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function generate(QuizAttempt $attempt, CertificateService $service)
    {
        if ($attempt->user_id !== Auth::id()) {
            abort(403);
        }

        $course = $attempt->course;
        $passMark = $course->quiz_pass_marks ?? 40;

        if ($attempt->score_percentage < $passMark) {
            return back()->withErrors(['error' => 'You must pass the quiz to get a certificate.']);
        }

        $service->generate(Auth::user(), $course, $attempt);

        Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->update(['status' => 'completed']);

        return redirect()->route('academy.dashboard.quiz.result', $attempt->id)
            ->with('certificate_generated', true);
    }

    public function download(Certificate $certificate)
    {
        if ($certificate->user_id !== Auth::id()) {
            abort(403);
        }

        $certificate->load(['user', 'course']);

        $logoSrc = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('logo.png')));
        $sealSrc = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('seal.png')));
        $sigSrc  = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('signature.png')));

        $pdf = Pdf::loadView('certificates.template', [
            'certificate' => $certificate,
            'user'        => $certificate->user,
            'course'      => $certificate->course,
            'logoSrc'     => $logoSrc,
            'sealSrc'     => $sealSrc,
            'sigSrc'      => $sigSrc,
        ])->setPaper('a4', 'portrait')
          ->setOptions([
              'isHtml5ParserEnabled' => true,
              'isRemoteEnabled'      => false,
              'marginTop'            => 0,
              'marginRight'          => 0,
              'marginBottom'         => 0,
              'marginLeft'           => 0,
          ]);

        return $pdf->download("certificate-{$certificate->certificate_number}.pdf");
    }

    public function verifyPage()
    {
        return Inertia::render('academy/verify-certificate', [
            'certificate' => null,
            'error'       => null,
        ]);
    }

    public function verify(string $code)
    {
        $certificate = Certificate::with(['user', 'course'])
            ->where('certificate_number', strtoupper(trim($code)))
            ->first();

        if (! $certificate) {
            return Inertia::render('academy/verify-certificate', [
                'certificate' => null,
                'error'       => 'No certificate found with that code. Please check and try again.',
            ]);
        }

        return Inertia::render('academy/verify-certificate', [
            'certificate' => [
                'certificate_number' => $certificate->certificate_number,
                'issued_at'          => $certificate->issued_at->format('jS M, Y'),
                'student_name'       => $certificate->user->name,
                'course_title'       => $certificate->course->title,
                'course_duration'    => $certificate->course->duration,
            ],
            'error' => null,
        ]);
    }
}
