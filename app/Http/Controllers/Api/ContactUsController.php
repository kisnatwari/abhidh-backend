<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactUs;
use App\Mail\ContactNotificationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class ContactUsController extends Controller
{
    /**
     * Store a newly created contact submission.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'source' => ['nullable', 'string', 'max:50'],
                'email' => ['required', 'email', 'max:255'],
                'message' => ['required', 'string', 'min:10'],
                'name' => ['nullable', 'string', 'max:255'],
                'phone' => ['nullable', 'string', 'max:20'],
                'subject' => ['nullable', 'string', 'max:255'],
                'courses' => ['nullable', 'string', 'max:500'], // Can be comma-separated course IDs or names
            ]);

            $contact = ContactUs::create(array_merge(
                $validated,
                ['source' => $validated['source'] ?? 'group']
            ));

            // Send notification email to admin
            try {
                Mail::to('bcrypt81@gmail.com')->queue(
                    new ContactNotificationMail($contact)
                );
            } catch (\Exception $e) {
                // Log error but don't fail the request if email fails
                Log::error('Failed to send contact notification email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Thank you for contacting us. We will get back to you soon.',
                'data' => $contact,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your message.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
