<?php

namespace App\Http\Controllers;

use App\Mail\AdminInvitationMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $users = $query->withCount('tokens')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->loadCount('tokens');
        
        return Inertia::render('users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Invite a new administrator user with a generated password.
     */
    public function inviteAdmin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
        ]);

        $temporaryPassword = Str::random(16);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $temporaryPassword,
            'is_admin' => true,
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        try {
            Mail::to($user->email)->queue(new AdminInvitationMail($user, $temporaryPassword));
        } catch (\Throwable $exception) {
            report($exception);

            return redirect()
                ->route('users.index')
                ->with('error', 'Admin account created but the invitation email could not be sent. Please share the credentials manually.');
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'Admin invited successfully. An email with credentials has been sent.');
    }

    /**
     * Mark a user's email as verified.
     */
    public function verify(User $user): RedirectResponse
    {
        $this->guardAgainstSelfAction($user);

        if (!$user->hasVerifiedEmail()) {
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'User marked as verified.');
    }

    /**
     * Mark a user's email as unverified.
     */
    public function unverify(User $user): RedirectResponse
    {
        $this->guardAgainstSelfAction($user);

        if ($user->hasVerifiedEmail()) {
            $user->forceFill([
                'email_verified_at' => null,
            ])->save();
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'User marked as unverified.');
    }

    /**
     * Delete a user account.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->guardAgainstSelfAction($user);

        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    protected function guardAgainstSelfAction(User $user): void
    {
        $authUser = Auth::user();

        if ($authUser && $authUser->id === $user->id) {
            abort(403, 'You cannot perform this action on your own account.');
        }
    }
}

