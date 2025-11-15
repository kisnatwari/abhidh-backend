<?php

namespace App\Http\Controllers;

use App\Models\ContactUs;
use App\Mail\ContactReplyMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactUsController extends Controller
{
    /**
     * Display a listing of contact submissions.
     */
    public function index(Request $request)
    {
        $query = ContactUs::with('repliedBy')->latest();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('source', 'like', '%' . $request->search . '%')
                  ->orWhere('subject', 'like', '%' . $request->search . '%')
                  ->orWhere('message', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by replied status
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            if ($request->status === 'replied') {
                $query->where('is_replied', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_replied', false);
            }
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $contacts = $query->paginate($perPage)->withQueryString();

        return Inertia::render('contact-us/index', [
            'contacts' => $contacts,
        ]);
    }

    /**
     * Display the specified contact submission.
     */
    public function show(ContactUs $contactUs)
    {
        $contactUs->load('repliedBy');
        
        return Inertia::render('contact-us/show', [
            'contact' => $contactUs,
        ]);
    }

    /**
     * Send reply email to the contact submission.
     */
    public function reply(Request $request, ContactUs $contactUs)
    {
        $validated = $request->validate([
            'reply_message' => ['required', 'string', 'min:10'],
        ]);

        try {
            // Send email
            Mail::to($contactUs->email)->queue(
                new ContactReplyMail($contactUs, $validated['reply_message'])
            );

            // Update contact record
            $contactUs->update([
                'is_replied' => true,
                'replied_at' => now(),
                'reply_message' => $validated['reply_message'],
                'replied_by' => auth()->id(),
            ]);

            return redirect()
                ->route('contact-us.index')
                ->with('success', 'Reply sent successfully to ' . $contactUs->email);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified contact submission.
     */
    public function destroy(ContactUs $contactUs)
    {
        $contactUs->delete();

        return redirect()
            ->route('contact-us.index')
            ->with('success', 'Contact submission deleted successfully.');
    }
}
