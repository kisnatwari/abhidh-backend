<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Team::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('designation', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $teams = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('teams/index', [
            'teams' => $teams,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('teams/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'designation' => ['required', 'string', 'max:255'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:50'],
            'photo' => ['nullable', 'image', 'max:2048'], // 2MB limit
        ]);

        // Handle photo upload if provided
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('teams', 'public');
            $validated['photo_path'] = $path;
        }

        $team = Team::create($validated);

        return redirect()
            ->route('teams.index')
            ->with('success', 'Team member created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team)
    {
        return Inertia::render('teams/show', [
            'team' => $team,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Team $team)
    {
        return Inertia::render('teams/edit', [
            'team' => $team,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'designation' => ['required', 'string', 'max:255'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:50'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        // Handle photo upload if provided
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($team->photo_path) {
                Storage::disk('public')->delete($team->photo_path);
            }
            $path = $request->file('photo')->store('teams', 'public');
            $validated['photo_path'] = $path;
        }

        $team->update($validated);

        return redirect()
            ->route('teams.index')
            ->with('success', 'Team member updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team)
    {
        // Delete photo if exists
        if ($team->photo_path) {
            Storage::disk('public')->delete($team->photo_path);
        }

        $team->delete();

        return redirect()
            ->route('teams.index')
            ->with('success', 'Team member deleted successfully.');
    }
}
